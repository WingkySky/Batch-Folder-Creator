// Excel 解析服务 - 纯函数实现，便于测试和维护
import * as XLSX from 'xlsx';

/**
 * 将二维数组转为树结构（Antd Tree 格式）
 * @param {Array} data - Excel 解析后的二维数组
 * @returns 树形结构数组
 */
function arrayToTree(data) {
  const build = (rows, level = 0) => {
    const map = new Map();
    rows.forEach((row) => {
      const key = row[level];
      if (key !== undefined && key !== null && key !== '') {
        const strKey = String(key);
        if (!map.has(strKey)) map.set(strKey, []);
        map.get(strKey).push(row);
      }
    });

    return Array.from(map.entries()).map(([name, group], idx) => {
      const children =
        level + 1 < group[0].length ? build(group, level + 1) : undefined;
      return {
        title: name,
        key: `${name}-${level}-${idx}`,
        children,
      };
    });
  };

  return build(data);
}

/**
 * 解析 Excel 文件
 * @param {File} file - Excel 文件对象
 * @returns Promise<{tree: Array, rowCount: number, columnCount: number}>
 */
export function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        let rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // 去除空行
        rows = rows.filter((row) =>
          row.some((cell) => cell !== undefined && cell !== null && cell !== '')
        );

        if (rows.length === 0) {
          throw new Error('Excel 内容为空');
        }

        // 跳过表头行
        rows = rows.slice(1);

        // 补齐每行长度
        const maxLen = Math.max(...rows.map((r) => r.length));
        rows = rows.map((r) => {
          const arr = Array.from(r);
          while (arr.length < maxLen) arr.push('');
          return arr;
        });

        // 去除全空列
        for (let col = maxLen - 1; col >= 0; col--) {
          if (rows.every((row) => !row[col])) {
            rows.forEach((row) => row.splice(col, 1));
          }
        }

        const tree = arrayToTree(rows);

        resolve({
          tree,
          rowCount: rows.length,
          columnCount: maxLen,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsArrayBuffer(file);
  });
}

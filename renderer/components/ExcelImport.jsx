// Excel 文件导入与解析模块，集成 xlsx 解析并生成树结构
import React, { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

// 工具函数：将二维数组转为树结构（Antd Tree 格式）
function arrayToTree(data) {
  // 递归构建树
  const build = (rows, level = 0) => {
    const map = new Map();
    rows.forEach(row => {
      const key = row[level];
      if (key) {
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(row);
      }
    });
    return Array.from(map.entries()).map(([name, group], idx) => ({
      title: name,
      key: name + '-' + level + '-' + idx,
      children: level + 1 < group[0].length ? build(group, level + 1) : undefined,
    }));
  };
  return build(data);
}

// 组件：Excel 文件导入
export default function ExcelImport({ onTreeData }) {
  // 记录已选择的文件名
  const [fileName, setFileName] = useState('');

  // 处理文件上传
  const beforeUpload = (file) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      message.error('请上传 Excel 文件（.xlsx/.xls）');
      return false;
    }
    setFileName(file.name);
    // 读取并解析 Excel 文件
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        let rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        // 去除空行和空列
        rows = rows.filter(row => row.some(cell => cell !== undefined && cell !== null && cell !== ''));
        if (rows.length === 0) throw new Error('Excel 内容为空');
        // 跳过首行表头，只处理数据行（新增功能备注）
        rows = rows.slice(1); // 跳过表头行，防止表头被当作文件夹名
        // 补齐每行长度一致
        const maxLen = Math.max(...rows.map(r => r.length));
        rows = rows.map(r => {
          const arr = Array.from(r);
          while (arr.length < maxLen) arr.push('');
          return arr;
        });
        // 去除全空列
        for (let col = maxLen - 1; col >= 0; col--) {
          if (rows.every(row => !row[col])) {
            rows.forEach(row => row.splice(col, 1));
          }
        }
        // 生成树结构
        const tree = arrayToTree(rows);
        // 传递给父组件
        onTreeData && onTreeData(tree);
        message.success('Excel 解析成功！');
      } catch (err) {
        message.error('Excel 解析失败：' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
    return false; // 阻止自动上传
  };

  return (
    <div>
      {/* 下载模板按钮，点击后下载public/template.xlsx，供用户参考填写 */}
      <Button
        type="link"
        style={{ marginBottom: 8 }}
        onClick={() => {
          window.open('/template.xlsx');
        }}
      >
        下载Excel模板
      </Button>
      {/* 上传按钮 */}
      <Upload beforeUpload={beforeUpload} showUploadList={false} accept=".xlsx,.xls">
        <Button icon={<UploadOutlined />}>选择 Excel 文件</Button>
      </Upload>
      {/* 显示已选择文件名 */}
      {fileName && <div style={{ marginTop: 8 }}>已选择：{fileName}</div>}
    </div>
  );
} 
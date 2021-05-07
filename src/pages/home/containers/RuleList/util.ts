import axios from 'axios';
import type { Namespace } from '@/utils/rule/type';

export async function loadJSONFile(): Promise<Namespace> {
  return new Promise((resolve, reject) => {
    let input = document.createElement('input');
    input.type = 'file';

    input.addEventListener('change', (evt: Event) => {
      const files = (evt.target as HTMLInputElement).files;
      if (!files || !files.length) {
        input = null;
        reject('未选取文件');
      }

      const reader = new FileReader();
      reader.onload = evt => {
        try {
          const config = JSON.parse((evt as any).target.result || '{}');
          resolve(config);
        } catch (e) {
          reject('文件解析失败，请确认文件内容符合 JSON 规范');
        } finally {
          input = null;
        }
      };

      reader.readAsText(files[0]);
    });

    input.click();
  });
}

export function exportJSONFile(rowData: any, filename: string) {
  const data = JSON.stringify(rowData, null, 2);
  const blob = new Blob([data], { type: 'text/json' });
  const a = document.createElement('a');
  a.download = `${filename}.json`;
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
  a.click();
}

export async function loadRemoteJSON(url: string) {
  return axios.get(url).then(res => {
    return res.data;
  });
}

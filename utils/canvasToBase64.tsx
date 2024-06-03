// utils/canvasToBase64.ts
export const canvasToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result as string);
      } else {
        reject('Conversion failed');
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};


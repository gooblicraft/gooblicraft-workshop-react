import { useEffect, useState } from 'react';
import defaultPackIcon from '../assets/goobli_icon.png';

export default function usePackIcon() {
  const [packIconFile, setPackIconFile] = useState(null);
  const [packIconUrl, setPackIconUrl] = useState(defaultPackIcon);

  const handlePackIconFile = (file) => {
    if (!file) return;
    if (file.type !== 'image/png') {
      alert('Only PNG files are allowed for pack_icon.png');
      return;
    }
    const renamed = new File([file], 'pack_icon.png', { type: 'image/png' });
    const url = URL.createObjectURL(renamed);
    if (packIconUrl && packIconFile) URL.revokeObjectURL(packIconUrl);
    setPackIconFile(renamed);
    setPackIconUrl(url);
  };

  const onIconDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    handlePackIconFile(f);
  };

  const onIconDragOver = (e) => e.preventDefault();

  useEffect(() => {
    return () => {
      if (packIconUrl && packIconFile) URL.revokeObjectURL(packIconUrl);
    };
  }, [packIconUrl]);

  const downloadPackIcon = async () => {
    if (packIconFile) {
      const a = document.createElement('a');
      a.href = packIconUrl;
      a.download = 'pack_icon.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }
    try {
      const res = await fetch(defaultPackIcon);
      const blob = await res.blob();
      const url = URL.createObjectURL(new File([blob], 'pack_icon.png', { type: 'image/png' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pack_icon.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download default pack_icon.png');
    }
  };

  return {
    packIconFile,
    packIconUrl,
    handlePackIconFile,
    onIconDrop,
    onIconDragOver,
    downloadPackIcon,
  };
}

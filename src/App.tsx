import { ImageEditor } from './editor';

const DOG_IMAGE = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80';

export default function App() {
  return (
    <div className="h-screen w-screen bg-gray-100">
      <ImageEditor
        src={DOG_IMAGE}
        onSave={(dataUrl) => {
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = 'edited-image.png';
          a.click();
        }}
      />
    </div>
  );
}

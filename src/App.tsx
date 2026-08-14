import { useState } from 'react';
import { BannerConfig } from './types';
import { INITIAL_BANNER_CONFIG } from './utils/defaultAssets';
import { downloadBannerZip } from './utils/zipGenerator';
import { EditorControls } from './components/EditorControls';
import { BannerPreview } from './components/BannerPreview';
import { CodeModal } from './components/CodeModal';

export default function App() {
  const [config, setConfig] = useState<BannerConfig>(INITIAL_BANNER_CONFIG);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  const handleConfigChange = (updated: Partial<BannerConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleResetToDefault = () => {
    setConfig({ ...INITIAL_BANNER_CONFIG });
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      await downloadBannerZip(config);
    } catch (err) {
      console.error('Error generating zip:', err);
      alert('Failed to generate ZIP file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-[#F3F4F6] font-sans antialiased text-slate-800">
      {/* Left Control Panel */}
      <div className="w-full lg:w-[420px] xl:w-[460px] h-1/2 lg:h-full shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white">
        <EditorControls
          config={config}
          onChange={handleConfigChange}
          onDownloadZip={handleDownloadZip}
          onOpenCodeModal={() => setIsCodeModalOpen(true)}
          onResetToDefault={handleResetToDefault}
          isDownloading={isDownloading}
        />
      </div>

      {/* Right Canvas Stage */}
      <div className="flex-1 h-1/2 lg:h-full overflow-hidden bg-slate-100">
        <BannerPreview
          config={config}
          onResetToDefault={handleResetToDefault}
        />
      </div>

      {/* Code Modal */}
      <CodeModal
        config={config}
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </div>
  );
}

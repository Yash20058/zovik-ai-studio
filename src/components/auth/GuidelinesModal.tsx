import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ShieldCheck, X, FileText, AlertTriangle, Headphones, Sparkles, Lock } from 'lucide-react';

interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const GuidelinesModal: React.FC<GuidelinesModalProps> = ({ isOpen, onClose, onAccept }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-gradient-to-b from-gray-900 via-gray-900 to-black border border-purple-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                {t('guidelines.modalTitle', 'Community Guidelines & Terms')}
              </h3>
              <p className="text-xs text-gray-400">
                {t('guidelines.version', 'Zovik Studio Safety & Copyright Protocol • v2026.1')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-300 leading-relaxed scrollbar-thin scrollbar-thumb-purple-600/40">
          
          {/* Section 1: Age */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-purple-300 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>{t('guidelines.sec1Title', '1. Strict 18+ Age Requirement')}</span>
            </div>
            <p className="text-xs text-gray-300">
              {t(
                'guidelines.sec1Body',
                'Zovik Studio is exclusively for creators 18 years of age or older. You must verify and confirm your adult age prior to accessing the creative suite, generative AI models, and DJ stem mixing tools.'
              )}
            </p>
          </div>

          {/* Section 2: Copyright & Fair Use */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-blue-300 text-sm">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>{t('guidelines.sec2Title', '2. Copyright & Fair-Use in DJ Mixing')}</span>
            </div>
            <p className="text-xs text-gray-300">
              {t(
                'guidelines.sec2Body',
                'When uploading external audio tracks to the dual DJ decks or generating stem mashups, respect intellectual property rights. AI stem remixing, beatmatching, and live performance recording are intended for fair-use creative expression and private DJ sessions.'
              )}
            </p>
          </div>

          {/* Section 3: Responsible AI Generation */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-violet-300 text-sm">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>{t('guidelines.sec3Title', '3. Responsible AI Generation')}</span>
            </div>
            <p className="text-xs text-gray-300">
              {t(
                'guidelines.sec3Body',
                'Users agree not to produce harmful, illegal, defamatory, or infringing audio or video content through the prompt engines. Generated media contains provenance metadata to promote creative authenticity and ethical AI deployment.'
              )}
            </p>
          </div>

          {/* Section 4: Audio Safety */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-pink-300 text-sm">
              <Headphones className="w-4 h-4 text-pink-400" />
              <span>{t('guidelines.sec4Title', '4. Audio Health & Hearing Safety')}</span>
            </div>
            <p className="text-xs text-gray-300">
              {t(
                'guidelines.sec4Body',
                'High-gain EQ boosts and sustained headphone listening above 85dB can cause irreversible hearing damage. Zovik provides dual-deck soft limiters. Keep monitor levels moderate when mastering audio.'
              )}
            </p>
          </div>

          {/* Section 5: Privacy */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-emerald-300 text-sm">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>{t('guidelines.sec5Title', '5. Privacy & Regional Customization')}</span>
            </div>
            <p className="text-xs text-gray-300">
              {t(
                'guidelines.sec5Body',
                'Your geographic region and song taste preferences are utilized strictly to personalize your AI music suggestions, BPM recommendations, and language localization.'
              )}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10 bg-black/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {t('common.close', 'Close')}
          </button>
          {onAccept && (
            <button
              type="button"
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t('guidelines.acceptAndClose', 'I Understand & Accept')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

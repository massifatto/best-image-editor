import { useState, useEffect, useCallback } from 'react';
import { useEditor } from '../../EditorContext';
import { AIActionRegistry } from '../../ai/AIActionRegistry';
import type { IAIAction, AIActionMeta, AIActionStatus, AIActionParam } from '../../ai/types';
import { Sparkles, ChevronRight, AlertCircle, Loader2, ArrowLeft, Beaker } from 'lucide-react';
import clsx from 'clsx';

import '../../ai/actions';

function ParamInput({
  param,
  value,
  onChange,
}: {
  param: AIActionParam;
  value: string | number;
  onChange: (v: string | number) => void;
}) {
  switch (param.type) {
    case 'textarea':
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={param.placeholder}
          rows={3}
          className="w-full px-3 py-2 border border-editor-border rounded-md text-sm resize-none focus:outline-none focus:border-editor-active"
        />
      );
    case 'select':
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-editor-border rounded-md text-sm bg-white focus:outline-none focus:border-editor-active"
        >
          {param.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case 'slider':
      return (
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={param.min}
            max={param.max}
            step={param.step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-editor-muted w-10 text-right">{value}</span>
        </div>
      );
    case 'number':
      return (
        <input
          type="number"
          value={value}
          min={param.min}
          max={param.max}
          step={param.step}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full px-3 py-2 border border-editor-border rounded-md text-sm focus:outline-none focus:border-editor-active"
        />
      );
    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={param.placeholder}
          className="w-full px-3 py-2 border border-editor-border rounded-md text-sm focus:outline-none focus:border-editor-active"
        />
      );
  }
}

function ActionCard({
  action,
  onSelect,
}: {
  action: AIActionMeta;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 p-3 rounded-lg border border-editor-border hover:border-editor-active hover:bg-blue-50/50 transition-colors text-left group"
    >
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
        <Sparkles size={18} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-editor-text">{action.name}</span>
          {action.isStub && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">
              <Beaker size={10} />
              Stub
            </span>
          )}
        </div>
        <p className="text-xs text-editor-muted truncate">{action.description}</p>
      </div>
      <ChevronRight size={16} className="text-editor-muted group-hover:text-editor-active shrink-0" />
    </button>
  );
}

function ActionDetail({
  action,
  onBack,
  canvasManager,
}: {
  action: IAIAction;
  onBack: () => void;
  canvasManager: any;
}) {
  const { saveHistory } = useEditor();
  const [params, setParams] = useState<Record<string, string | number>>(() => {
    const defaults: Record<string, string | number> = {};
    action.meta.params.forEach((p) => {
      defaults[p.key] = p.default;
    });
    return defaults;
  });
  const [status, setStatus] = useState<AIActionStatus>('idle');
  const [error, setError] = useState('');

  const execute = useCallback(async () => {
    setStatus('loading');
    setError('');

    const imageDataUrl = action.meta.requiresImage
      ? canvasManager?.getImageDataURL('png', 1) ?? null
      : null;

    const result = await action.execute(imageDataUrl, params);

    if (result.error) {
      setStatus('error');
      setError(result.error);
      return;
    }

    if (result.imageDataUrl && canvasManager) {
      await canvasManager.loadImageFromDataUrl(result.imageDataUrl);
      saveHistory();
    }

    setStatus('success');
  }, [action, params, canvasManager, saveHistory]);

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-editor-muted hover:text-editor-text transition-colors"
      >
        <ArrowLeft size={14} />
        Back to actions
      </button>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-editor-text">{action.meta.name}</h3>
          <p className="text-xs text-editor-muted">{action.meta.description}</p>
        </div>
      </div>

      {/* Params */}
      <div className="space-y-3">
        {action.meta.params.map((param) => (
          <div key={param.key}>
            <label className="text-xs text-editor-muted font-medium mb-1 block">{param.label}</label>
            <ParamInput
              param={param}
              value={params[param.key]}
              onChange={(v) => setParams((p) => ({ ...p, [param.key]: v }))}
            />
          </div>
        ))}
      </div>

      {/* Error */}
      {status === 'error' && error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Success */}
      {status === 'success' && (
        <div className="p-3 bg-green-50 rounded-lg text-sm text-green-700">
          Action completed successfully!
        </div>
      )}

      {/* Execute */}
      <button
        onClick={execute}
        disabled={status === 'loading'}
        className={clsx(
          'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors',
          status === 'loading'
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700',
        )}
      >
        {status === 'loading' ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Run {action.meta.name}
          </>
        )}
      </button>
    </div>
  );
}

export function AIPanel() {
  const { canvasManager } = useEditor();
  const [actions, setActions] = useState<IAIAction[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setActions(AIActionRegistry.getAll());
    const unsub = AIActionRegistry.onChange(() => {
      setActions(AIActionRegistry.getAll());
    });
    return unsub;
  }, []);

  const selected = selectedId ? actions.find((a) => a.meta.id === selectedId) : null;

  if (selected) {
    return (
      <ActionDetail
        action={selected}
        onBack={() => setSelectedId(null)}
        canvasManager={canvasManager}
      />
    );
  }

  const categories = [
    { id: 'generate', label: 'Generate' },
    { id: 'enhance', label: 'Enhance' },
    { id: 'transform', label: 'Transform' },
    { id: 'remove', label: 'Remove' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-editor-text">AI Actions</h3>
          <p className="text-[11px] text-editor-muted">{actions.length} actions available</p>
        </div>
      </div>

      {categories.map((cat) => {
        const catActions = actions.filter((a) => a.meta.category === cat.id);
        if (catActions.length === 0) return null;
        return (
          <div key={cat.id}>
            <h4 className="text-[11px] font-semibold text-editor-muted uppercase tracking-wider mb-2">
              {cat.label}
            </h4>
            <div className="space-y-1.5">
              {catActions.map((a) => (
                <ActionCard
                  key={a.meta.id}
                  action={a.meta}
                  onSelect={() => setSelectedId(a.meta.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowPathIcon, BellAlertIcon, EnvelopeIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { axios, emailTemplateAPI, handleApiError } from '../../services/api';

const inputClass =
  'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm';

const DESCRIPTIONS = {
  inquiry_rejected: 'Sent to the customer when staff reject an inquiry.',
  payment_reminder: 'Sent when a quotation was sent but is not paid yet. Stops once paid, rejected or closed.'
};

const ScheduleEditor = ({ days, onChange }) => {
  const [newDay, setNewDay] = useState('');
  const addDay = () => {
    const day = Number(newDay);
    if (!Number.isInteger(day) || day < 1 || day > 365) {
      toast.error('Enter a day between 1 and 365');
      return;
    }
    onChange([...new Set([...days, day])].sort((a, b) => a - b));
    setNewDay('');
  };

  return (
    <div>
      <span className="block text-sm font-medium text-gray-700">Send reminders on these days after the quotation is sent</span>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {days.map((day) => (
          <span key={day} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            Day {day}
            <button type="button" onClick={() => onChange(days.filter((d) => d !== day))}
              className="rounded-full p-0.5 hover:bg-blue-100" aria-label={`Remove day ${day}`}>
              <XMarkIcon className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <div className="inline-flex items-center overflow-hidden rounded-md border border-gray-300">
          <input
            type="number"
            min={1}
            max={365}
            value={newDay}
            onChange={(e) => setNewDay(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addDay();
              }
            }}
            placeholder="Day"
            className="w-20 px-2 py-1 text-sm focus:outline-none"
          />
          <button type="button" onClick={addDay} className="inline-flex items-center gap-1 border-l border-gray-300 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50">
            <PlusIcon className="h-4 w-4" /> Add
          </button>
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-500">The schedule restarts whenever a quotation is re-shared.</p>
    </div>
  );
};

const TemplateCard = ({ template, onSaved }) => {
  const [draft, setDraft] = useState(template);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const bodyRef = useRef(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(template);

  useEffect(() => setDraft(template), [template]);

  const update = (changes) => {
    setDraft((prev) => ({ ...prev, ...changes }));
    setPreview(null);
  };

  // Insert a {{placeholder}} at the cursor in the message
  const insertPlaceholder = (name) => {
    const el = bodyRef.current;
    const token = `{{${name}}}`;
    if (!el) return update({ body: `${draft.body}${token}` });
    const start = el.selectionStart ?? draft.body.length;
    const end = el.selectionEnd ?? draft.body.length;
    update({ body: `${draft.body.slice(0, start)}${token}${draft.body.slice(end)}` });
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + token.length;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await emailTemplateAPI.save(template.key, draft);
      onSaved(response.data.template);
      toast.success(`${template.name} email saved`);
    } catch (error) {
      toast.error(handleApiError(error).error);
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!window.confirm('Reset this email to the default text?')) return;
    try {
      const response = await emailTemplateAPI.reset(template.key);
      onSaved(response.data.template);
      toast.success('Reset to default');
    } catch (error) {
      toast.error(handleApiError(error).error);
    }
  };

  const showPreview = async () => {
    try {
      const response = await emailTemplateAPI.preview(template.key, { subject: draft.subject, body: draft.body });
      setPreview(response.data);
    } catch (error) {
      toast.error(handleApiError(error).error);
    }
  };

  const Icon = template.hasSchedule ? BellAlertIcon : EnvelopeIcon;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Icon className="h-6 w-6 flex-shrink-0 text-blue-600" />
          <div>
            <h2 className="text-base font-semibold text-gray-900">{template.name}</h2>
            <p className="text-xs text-gray-500">{DESCRIPTIONS[template.key]}</p>
          </div>
        </div>
        {template.hasSchedule && (
          <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={draft.enabled} onChange={(e) => update({ enabled: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            Reminders on
          </label>
        )}
      </div>

      <div className={`mt-4 space-y-4 ${template.hasSchedule && !draft.enabled ? 'opacity-60' : ''}`}>
        {template.hasSchedule && (
          <ScheduleEditor days={draft.scheduleDays || []} onChange={(scheduleDays) => update({ scheduleDays })} />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <input type="text" className={inputClass} value={draft.subject} onChange={(e) => update({ subject: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <textarea ref={bodyRef} rows={10} className={`${inputClass} font-mono`} value={draft.body}
            onChange={(e) => update({ body: e.target.value })} />
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-gray-500">Insert:</span>
            {template.placeholders.map((name) => (
              <button key={name} type="button" onClick={() => insertPlaceholder(name)}
                className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700 hover:bg-gray-200">
                {`{{${name}}}`}
              </button>
            ))}
          </div>
        </div>

        {preview && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Preview with sample data</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{preview.subject}</p>
            <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{preview.text}</p>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={reset} className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
          Reset to default
        </button>
        <button type="button" onClick={showPreview} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Preview
        </button>
        <button type="button" onClick={save} disabled={!dirty || saving}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
          {saving ? 'Saving...' : dirty ? 'Save' : 'Saved'}
        </button>
      </div>
    </section>
  );
};

/** CMS tab: editable customer emails and the payment reminder schedule */
const EmailTemplatesPanel = () => {
  const [templates, setTemplates] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    emailTemplateAPI
      .list()
      .then((response) => setTemplates(response.data.templates))
      .catch((error) => {
        if (axios.isCancel(error)) return;
        toast.error(handleApiError(error).error);
        setTemplates([]);
      });
  }, []);

  const handleSaved = (saved) =>
    setTemplates((prev) => prev.map((template) => (template.key === saved.key ? saved : template)));

  const runReminders = async () => {
    setRunning(true);
    try {
      const { summary } = (await emailTemplateAPI.runPaymentReminders()).data;
      if (summary.disabled) {
        toast('Payment reminders are turned off', { icon: 'ℹ️' });
      } else {
        toast.success(`Checked ${summary.checked} quotation(s): ${summary.sent} reminder(s) sent${summary.failed ? `, ${summary.failed} not sent (check SMTP settings)` : ''}`);
      }
    } catch (error) {
      toast.error(handleApiError(error).error);
    } finally {
      setRunning(false);
    }
  };

  if (!templates) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {templates.map((template) => (
        <TemplateCard key={template.key} template={template} onSaved={handleSaved} />
      ))}
      <div className="flex flex-col gap-2 rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
        <span>Reminders are checked automatically every hour. Emails are only sent when SMTP is configured on the server.</span>
        <button type="button" onClick={runReminders} disabled={running}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-60">
          <ArrowPathIcon className={`h-4 w-4 ${running ? 'animate-spin' : ''}`} />
          {running ? 'Checking...' : 'Check reminders now'}
        </button>
      </div>
    </div>
  );
};

export default EmailTemplatesPanel;

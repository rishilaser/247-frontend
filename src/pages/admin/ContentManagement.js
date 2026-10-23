import React, { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon,
  LinkIcon,
  ListBulletIcon,
  PhotoIcon,
  PlusIcon,
  RectangleStackIcon,
  TrashIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { axios, contentAPI, handleApiError } from '../../services/api';
import { AmbientVideo, ImageView, MediaView, getEntryMedia } from '../../components/content/ContentMedia';
import SignupShowcase from '../../components/content/SignupShowcase';
import { InstructionsList } from '../../components/content/InstructionsDrawer';
import EmailTemplatesPanel from './EmailTemplatesPanel';

const SECTIONS = [
  {
    key: 'signup',
    label: 'Signup Page',
    description: 'Images and videos shown on the right side of the customer sign-up page (below the form on phones). Videos play by themselves, muted and looping, with no controls.'
  },
  {
    key: 'instructions',
    label: 'Customer Instructions',
    description: 'Customers open these from the "Instructions" button in the top bar. Add as many instructions as you need.'
  },
  {
    key: 'emails',
    label: 'Emails & Reminders',
    description: 'Emails sent to customers when an inquiry is rejected and when a sent quotation is still unpaid. Each email is saved on its own.'
  }
];

// Tabs that edit site content (the Emails tab manages its own data)
const isContentKey = (key) => key === 'signup' || key === 'instructions';

const EMPTY = {
  signup: { media: [] },
  instructions: { heading: '', subheading: '', entries: [] }
};

// Keep only the fields each section edits (drops _id/timestamps from the API response)
const fromApi = (key, data = {}) => {
  if (key === 'signup') {
    return { media: data.media || [] };
  }
  return {
    heading: data.heading || '',
    subheading: data.subheading || '',
    entries: data.entries || []
  };
};

const inputClass =
  'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm';
const labelClass = 'block text-sm font-medium text-gray-700';
// Same look as inputClass, without the full-width/top-margin, for inputs laid out in a row
const rowInputClass =
  'px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm';

const isLink = (url) => /^https?:\/\//i.test(url);

const moveItem = (list, index, direction) => {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

const replaceAt = (list, index, changes) => list.map((item, i) => (i === index ? { ...item, ...changes } : item));

const ItemToolbar = ({ index, count, isActive, onMove, onToggle, onRemove }) => (
  <div className="flex items-center gap-1">
    <button type="button" onClick={() => onMove(-1)} disabled={index === 0}
      className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30" title="Move up">
      <ArrowUpIcon className="h-4 w-4" />
    </button>
    <button type="button" onClick={() => onMove(1)} disabled={index === count - 1}
      className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30" title="Move down">
      <ArrowDownIcon className="h-4 w-4" />
    </button>
    {onToggle && (
      <button type="button" onClick={onToggle}
        className={`p-1.5 rounded-md hover:bg-gray-100 ${isActive ? 'text-green-600' : 'text-gray-400'}`}
        title={isActive ? 'Visible to customers - click to hide' : 'Hidden - click to show'}>
        {isActive ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
      </button>
    )}
    <button type="button" onClick={onRemove} className="p-1.5 rounded-md text-red-500 hover:bg-red-50" title="Remove">
      <TrashIcon className="h-4 w-4" />
    </button>
  </div>
);

const SectionCard = ({ n, icon: Icon, title, hint, action, children }) => (
  <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0">
        {n !== undefined ? (
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{n}</span>
        ) : (
          Icon && <Icon className="h-6 w-6 flex-shrink-0 text-blue-600" />
        )}
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            {n !== undefined && Icon && <Icon className="h-5 w-5 text-blue-600" />}
            {title}
          </h2>
          {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
        </div>
      </div>
      {action}
    </div>
    <div className="mt-4">{children}</div>
  </section>
);

const EmptyNote = ({ children }) => (
  <p className="text-sm text-gray-500 text-center py-6 border border-dashed border-gray-300 rounded-lg">{children}</p>
);

/**
 * Link field + upload button for one piece of media.
 * accept: 'video' | 'image' | 'both'. Calls onPick(url, mediaType).
 */
const MediaPicker = ({ accept = 'video', onPick, buttonLabel }) => {
  const [link, setLink] = useState('');
  const [progress, setProgress] = useState(null);
  const fileRef = useRef(null);

  const acceptAttr = accept === 'image' ? 'image/*' : accept === 'video' ? 'video/*' : 'video/*,image/*';

  const addLink = () => {
    const url = link.trim();
    if (!isLink(url)) {
      toast.error('Enter a full link starting with http:// or https://');
      return;
    }
    const looksLikeImage = /\.(jpe?g|png|gif|webp|bmp|svg|avif)(\?|#|$)/i.test(url);
    onPick(url, accept === 'image' || (accept === 'both' && looksLikeImage) ? 'image' : 'video');
    setLink('');
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if ((accept === 'video' && !isVideo) || (accept === 'image' && !isImage) || (!isVideo && !isImage)) {
      toast.error(accept === 'image' ? 'Please choose a photo' : accept === 'video' ? 'Please choose a video file' : 'Please choose a video or photo');
      return;
    }
    setProgress(0);
    try {
      const response = await contentAPI.uploadMedia(file, setProgress);
      onPick(response.data.url, response.data.mediaType);
      toast.success('Uploaded. Click Save to publish.');
    } catch (error) {
      toast.error(handleApiError(error).error);
    } finally {
      setProgress(null);
    }
  };

  const placeholder = accept === 'image'
    ? 'Paste a photo link (https://...)'
    : accept === 'both'
      ? 'Paste a YouTube, Vimeo, .mp4 or image link'
      : 'Paste a YouTube, Vimeo or .mp4 link';

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="flex flex-1 min-w-0 rounded-md border border-gray-300 shadow-sm overflow-hidden bg-white">
        <span className="inline-flex items-center px-3 bg-gray-50 border-r border-gray-200">
          <LinkIcon className="h-4 w-4 text-gray-500" />
        </span>
        <input
          type="url"
          className="flex-1 min-w-0 px-3 py-2 text-sm focus:outline-none"
          placeholder={placeholder}
          value={link}
          onChange={(e) => setLink(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addLink();
            }
          }}
        />
        <button type="button" onClick={addLink}
          className="inline-flex items-center gap-1 px-3 text-sm font-medium text-blue-600 hover:bg-blue-50 border-l border-gray-200">
          <PlusIcon className="h-4 w-4" /> Add
        </button>
      </div>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={progress !== null}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-blue-600 text-blue-600 text-sm font-medium hover:bg-blue-50 disabled:opacity-60 whitespace-nowrap"
      >
        <ArrowUpTrayIcon className="h-4 w-4" />
        {progress !== null ? `Uploading ${progress}%` : buttonLabel || 'Upload'}
      </button>
      <input ref={fileRef} type="file" accept={acceptAttr} className="hidden" onChange={handleFile} />
    </div>
  );
};

/* ---------------------------- Signup page form ---------------------------- */

const SignupForm = ({ content, update }) => {
  const { media } = content;

  return (
    <SectionCard
      icon={PhotoIcon}
      title={`Images & videos (${media.length})`}
      hint="One item fills the whole right side. With several, they are stacked one below another."
    >
      <MediaPicker
        accept="both"
        buttonLabel="Upload image or video"
        onPick={(url, type) => update({ media: [...media, { type, url, isActive: true }] })}
      />
      {media.length === 0 ? (
        <div className="mt-4">
          <EmptyNote>Nothing added yet - the sign-up form is shown on its own until you add an image or video.</EmptyNote>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {media.map((item, index) => (
            <div key={item._id || `${item.url}-${index}`}
              className={`rounded-lg border p-3 ${item.isActive ? 'border-gray-200' : 'border-dashed border-gray-300 bg-gray-50 opacity-75'}`}>
              {item.type === 'image' ? (
                <ImageView url={item.url} className="aspect-video [&>img]:h-full [&>img]:max-h-none [&>img]:object-cover" />
              ) : (
                <AmbientVideo url={item.url} className="aspect-video rounded-lg" />
              )}
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  {item.type === 'image' ? <PhotoIcon className="h-4 w-4" /> : <VideoCameraIcon className="h-4 w-4" />}
                  {item.type === 'image' ? 'Image' : 'Video'} {index + 1}{!item.isActive && ' · hidden'}
                </span>
                <ItemToolbar index={index} count={media.length} isActive={item.isActive}
                  onMove={(dir) => update({ media: moveItem(media, index, dir) })}
                  onToggle={() => update({ media: replaceAt(media, index, { isActive: !item.isActive }) })}
                  onRemove={() => update({ media: media.filter((_, i) => i !== index) })} />
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
};

/* ------------------------ Customer instructions form ----------------------- */

// Upload several videos or photos at once (instructions use uploaded files only, no links)
const UploadMediaButton = ({ kind, onUploaded }) => {
  const [progress, setProgress] = useState(null);
  const fileRef = useRef(null);
  const isVideo = kind === 'video';

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    const valid = files.filter((file) => file.type.startsWith(isVideo ? 'video/' : 'image/'));
    if (valid.length < files.length) {
      toast.error(`Skipped ${files.length - valid.length} file(s) that are not ${isVideo ? 'videos' : 'photos'}`);
    }
    if (valid.length === 0) return;

    const uploaded = [];
    try {
      for (let i = 0; i < valid.length; i += 1) {
        setProgress({ index: i + 1, total: valid.length, percent: 0 });
        const response = await contentAPI.uploadMedia(valid[i], (percent) =>
          setProgress({ index: i + 1, total: valid.length, percent })
        );
        uploaded.push({ type: response.data.mediaType, url: response.data.url, isActive: true });
      }
      toast.success(`${uploaded.length} ${isVideo ? 'video' : 'photo'}(s) uploaded. Click Save to publish.`);
    } catch (error) {
      toast.error(handleApiError(error).error);
    } finally {
      if (uploaded.length) onUploaded(uploaded);
      setProgress(null);
    }
  };

  const Icon = isVideo ? VideoCameraIcon : PhotoIcon;
  return (
    <>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={progress !== null}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-60"
      >
        {progress ? <ArrowUpTrayIcon className="h-4 w-4 animate-pulse" /> : <Icon className="h-4 w-4" />}
        {progress
          ? `Uploading ${progress.index}/${progress.total} · ${progress.percent}%`
          : isVideo ? 'Upload videos' : 'Upload photos'}
      </button>
      <input ref={fileRef} type="file" multiple accept={isVideo ? 'video/*' : 'image/*'} className="hidden" onChange={handleFiles} />
    </>
  );
};

const entryKey = (entry) => entry._id || entry._key;

const EntryEditor = ({ entry, index, count, onChange, onAppendMedia, onMove, onRemove }) => {
  const media = getEntryMedia(entry);
  const setMedia = (next) => onChange({ media: next, mediaUrl: '', mediaType: 'none' });

  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${entry.isActive ? 'border-gray-200 bg-white' : 'border-dashed border-gray-300 bg-gray-50 opacity-80'}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">{index + 1}</span>
          <span className="text-sm font-semibold text-gray-900 truncate">{entry.title || `Instruction ${index + 1}`}</span>
          {!entry.isActive && <span className="text-xs text-gray-500">· hidden</span>}
        </div>
        <ItemToolbar index={index} count={count} isActive={entry.isActive} onMove={onMove}
          onToggle={() => onChange({ isActive: !entry.isActive })} onRemove={onRemove} />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Title</label>
          <input type="text" className={inputClass} placeholder="e.g. How to upload drawings" value={entry.title}
            onChange={(e) => onChange({ title: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Subtitle</label>
          <input type="text" className={inputClass} placeholder="e.g. Step 1 · 2 minutes" value={entry.subtitle}
            onChange={(e) => onChange({ subtitle: e.target.value })} />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={labelClass}>Videos &amp; photos ({media.length})</span>
          <div className="flex flex-wrap gap-2">
            <UploadMediaButton kind="video" onUploaded={(items) => onAppendMedia(items)} />
            <UploadMediaButton kind="image" onUploaded={(items) => onAppendMedia(items)} />
          </div>
        </div>
        {media.length === 0 ? (
          <p className="mt-2 text-xs text-gray-500">No videos or photos. You can add as many as you need, or leave it text only.</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {media.map((item, i) => (
              <div key={item._id || `${item.url}-${i}`} className="rounded-lg border border-gray-200 p-2">
                <MediaView item={item} alt={entry.title} />
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    {item.type === 'image' ? <PhotoIcon className="h-4 w-4" /> : <VideoCameraIcon className="h-4 w-4" />}
                    {item.type === 'image' ? 'Photo' : 'Video'} {i + 1}
                  </span>
                  <ItemToolbar index={i} count={media.length}
                    onMove={(dir) => setMedia(moveItem(media, i, dir))}
                    onRemove={() => setMedia(media.filter((_, j) => j !== i))} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        <label className={labelClass}>Description</label>
        <textarea rows={4} className={inputClass} placeholder="Explain the steps. New lines show as separate lines."
          value={entry.description} onChange={(e) => onChange({ description: e.target.value })} />
      </div>
    </div>
  );
};

const InstructionsForm = ({ content, update, updateWith }) => {
  const { entries } = content;
  const addEntry = () =>
    update({ entries: [...entries, { _key: `new-${Date.now()}`, title: '', subtitle: '', media: [], description: '', isActive: true }] });

  // Uploads finish later, so append to the latest version of that entry (found by key, not index)
  const appendMedia = (key, items) =>
    updateWith((prev) => ({
      ...prev,
      entries: prev.entries.map((entry) =>
        entryKey(entry) === key ? { ...entry, media: [...getEntryMedia(entry), ...items], mediaUrl: '', mediaType: 'none' } : entry
      )
    }));

  return (
    <div className="space-y-6">
      <SectionCard icon={RectangleStackIcon} title="Panel" hint="Title in the panel header and an optional intro shown above the instructions.">
        <div className="grid gap-4">
          <div>
            <label className={labelClass}>Panel title</label>
            <input type="text" className={inputClass} placeholder="Instructions" value={content.heading}
              onChange={(e) => update({ heading: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Intro (optional)</label>
            <textarea rows={2} className={inputClass} value={content.subheading}
              onChange={(e) => update({ subheading: e.target.value })} />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={ListBulletIcon}
        title={`Instructions (${entries.length})`}
        hint="Each instruction is a card with a title, subtitle, a video or photo, and a description."
        action={
          <button type="button" onClick={addEntry}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 text-sm font-medium text-white hover:bg-blue-700">
            <PlusIcon className="h-4 w-4" /> Add instruction
          </button>
        }
      >
        {entries.length === 0 ? (
          <EmptyNote>No instructions yet. Click "Add instruction" to create the first one.</EmptyNote>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <EntryEditor
                key={entry._id || index}
                entry={entry}
                index={index}
                count={entries.length}
                onChange={(changes) => update({ entries: replaceAt(entries, index, changes) })}
                onAppendMedia={(items) => appendMedia(entryKey(entry), items)}
                onMove={(dir) => update({ entries: moveItem(entries, index, dir) })}
                onRemove={() => update({ entries: entries.filter((_, i) => i !== index) })}
              />
            ))}
            <button type="button" onClick={addEntry}
              className="w-full inline-flex items-center justify-center gap-1 rounded-lg border border-dashed border-blue-300 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50">
              <PlusIcon className="h-4 w-4" /> Add another instruction
            </button>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

/* -------------------------------- Preview -------------------------------- */

const Preview = ({ sectionKey, content }) => (
  <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2.5">
      <span className="text-sm font-semibold text-gray-900">Live preview</span>
      <span className="text-xs text-gray-500">{sectionKey === 'signup' ? 'Sign-up page · right side' : 'Instructions panel'}</span>
    </div>
    <div className="max-h-[calc(100vh-14rem)] overflow-y-auto">
      {sectionKey === 'signup' ? (
        <div className="h-[32rem] bg-white p-4">
          {content.media.some((item) => item.isActive !== false) ? (
            <SignupShowcase media={content.media} />
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-gray-500">No visible images or videos yet.</p>
          )}
        </div>
      ) : (
        <div className="bg-white">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">{content.heading || 'Instructions'}</p>
            <p className="text-xs text-gray-500">Guides and videos from the Cutbend team</p>
          </div>
          <div className="px-4 py-4">
            {content.entries.some((entry) => entry.isActive) || content.subheading ? (
              <InstructionsList content={content} />
            ) : (
              <p className="py-8 text-center text-sm text-gray-500">No visible instructions yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);

/* --------------------------------- Page ---------------------------------- */

const ContentManagement = () => {
  const [activeKey, setActiveKey] = useState(SECTIONS[0].key);
  const [content, setContent] = useState(EMPTY.signup);
  // Section the current `content` belongs to; forms render only once it matches the active tab
  const [contentKey, setContentKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const activeSection = SECTIONS.find((section) => section.key === activeKey);

  const loadContent = useCallback(async (key) => {
    setLoading(true);
    try {
      const response = await contentAPI.getAdminContent(key);
      setContent(fromApi(key, response.data.content));
      setContentKey(key);
      setDirty(false);
      setLoading(false);
    } catch (error) {
      // A newer request for the same section replaced this one
      if (axios.isCancel(error)) return;
      toast.error(handleApiError(error).error);
      setContent(EMPTY[key]);
      setContentKey(key);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isContentKey(activeKey)) loadContent(activeKey);
  }, [activeKey, loadContent]);

  // Warn before leaving the page with unsaved edits
  useEffect(() => {
    if (!dirty) return undefined;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  const update = (changes) => {
    setContent((prev) => ({ ...prev, ...changes }));
    setDirty(true);
  };

  const updateWith = (fn) => {
    setContent(fn);
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await contentAPI.saveContent(activeKey, content);
      setContent(fromApi(activeKey, response.data.content));
      setDirty(false);
      toast.success(`${activeSection.label} saved`);
    } catch (error) {
      toast.error(handleApiError(error).error);
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (key) => {
    if (key === activeKey) return;
    if (dirty && !window.confirm('You have unsaved changes. Discard them?')) return;
    setActiveKey(key);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CMS <span className="text-base font-medium text-gray-500">· Content Management</span></h1>
          <p className="mt-1 text-sm text-gray-600">Edit what customers see on the sign-up page and in the Instructions panel.</p>
        </div>
        {isContentKey(activeKey) && <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading || !dirty || contentKey !== activeKey}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : dirty ? 'Save Changes' : 'Saved'}
        </button>}
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          {SECTIONS.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => handleTabChange(section.key)}
              className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium ${
                activeKey === section.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      <p className="text-sm text-gray-500 -mt-3">{activeSection.description}</p>

      {activeKey === 'emails' ? (
        <div className="max-w-4xl">
          <EmailTemplatesPanel />
        </div>
      ) : loading || contentKey !== activeKey ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px] items-start">
          <div className="min-w-0">
            {activeKey === 'signup'
              ? <SignupForm content={content} update={update} />
              : <InstructionsForm content={content} update={update} updateWith={updateWith} />}
          </div>
          {/* Column stretches to the form's height so the preview can stay in view while scrolling */}
          <div className="min-w-0 xl:self-stretch">
            <div className="xl:sticky xl:top-[110px]">
              <Preview sectionKey={activeKey} content={content} />
            </div>
          </div>
        </div>
      )}

      {dirty && !loading && contentKey === activeKey && (
        <div className="sticky bottom-4 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;

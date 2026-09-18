import { useId, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, LoaderCircle } from 'lucide-react';
import { Button } from './ui/button';
import { InputGroup, InputGroupInput, InputGroupAddon } from './ui/input-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Field, FieldLabel } from './ui/field';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from './ui/alert-dialog';
import { Alert, AlertDescription } from './ui/alert';
import { errorMessage } from '@/lib/api';

export function SearchInput({ value, onChange, placeholder = 'Cari...' }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <InputGroup className="w-full sm:max-w-xs"><InputGroupInput aria-label={placeholder} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /><InputGroupAddon><Search /></InputGroupAddon></InputGroup>;
}

export function SelectField({ label, value, onChange, options, placeholder = 'Pilih...', disabled = false }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; placeholder?: string; disabled?: boolean }) {
  const id = useId();
  return <Field><FieldLabel htmlFor={id}>{label}</FieldLabel><Select value={value} onValueChange={onChange} disabled={disabled}><SelectTrigger id={id} className="w-full"><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent><SelectGroup>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>;
}

export function Pagination({ page, total, pageSize = 10, onChange }: { page: number; total: number; pageSize?: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4"><p className="text-sm text-muted-foreground">{total ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} dari ${total}` : '0 data'}</p><div className="flex items-center gap-2"><Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Halaman sebelumnya"><ChevronLeft /></Button><span className="px-2 text-sm tabular-nums">{page} / {pages}</span><Button variant="outline" size="icon" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Halaman berikutnya"><ChevronRight /></Button></div></div>;
}

export function ConfirmDelete({ title, description, onClose, onConfirm }: { title: string; description: string; onClose: () => void; onConfirm: () => Promise<void> }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function confirm() {
    if (pending) return;
    setPending(true);
    setError('');
    try { await onConfirm(); onClose(); }
    catch (err) { setError(errorMessage(err)); }
    finally { setPending(false); }
  }
  return <AlertDialog open onOpenChange={(open) => { if (!open && !pending) onClose(); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader>{error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> }<AlertDialogFooter><AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel><AlertDialogAction variant="destructive" disabled={pending} onClick={(event) => { event.preventDefault(); void confirm(); }}>{pending && <LoaderCircle className="animate-spin" data-icon="inline-start" />}{pending ? 'Menghapus...' : 'Ya, hapus'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}

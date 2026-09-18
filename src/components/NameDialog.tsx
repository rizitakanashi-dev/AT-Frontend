import { useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Field, FieldLabel, FieldGroup } from './ui/field';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { errorMessage } from '@/lib/api';

export function NameDialog({ title, label, initial = '', onClose, onSave }: { title: string; label: string; initial?: string; onClose: () => void; onSave: (name: string) => Promise<void> }) {
  const [name, setName] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || pending) return;
    setPending(true);
    setError('');
    try { await onSave(name.trim()); onClose(); }
    catch (err) { setError(errorMessage(err)); }
    finally { setPending(false); }
  }
  return <Dialog open onOpenChange={(open) => { if (!open && !pending) onClose(); }}><DialogContent showCloseButton={!pending}><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>Gunakan nama yang jelas dan mudah dikenali oleh tim.</DialogDescription></DialogHeader><form onSubmit={submit} className="flex flex-col gap-5"><FieldGroup><Field><FieldLabel htmlFor="entity-name">{label}</FieldLabel><Input id="entity-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} disabled={pending} autoFocus /></Field></FieldGroup>{error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}<DialogFooter><Button variant="outline" type="button" onClick={onClose} disabled={pending}>Batal</Button><Button type="submit" disabled={pending || !name.trim()}>{pending && <LoaderCircle className="animate-spin" data-icon="inline-start" />}{pending ? 'Menyimpan...' : 'Simpan'}</Button></DialogFooter></form></DialogContent></Dialog>;
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff, LoaderCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldGroup, FieldError } from '@/components/ui/field';
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from '@/components/ui/input-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginSchema, type LoginFormValues } from '../schemas/loginSchema';

export function LoginForm({ onSubmit, errorMsg }: { onSubmit: (data: LoginFormValues) => Promise<void>; errorMsg: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema), defaultValues: { nama: '', password: '' } });
  return <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
    {errorMsg && <Alert variant="destructive"><AlertCircle /><AlertDescription>{errorMsg}</AlertDescription></Alert>}
    <FieldGroup>
      <Field data-invalid={!!errors.nama}><FieldLabel htmlFor="nama">Nama pengguna</FieldLabel><Input id="nama" autoComplete="username" placeholder="Masukkan nama pengguna" aria-invalid={!!errors.nama} aria-describedby={errors.nama ? 'nama-error' : undefined} disabled={isSubmitting} {...register('nama')} />{errors.nama && <FieldError id="nama-error">{errors.nama.message}</FieldError>}</Field>
      <Field data-invalid={!!errors.password}><FieldLabel htmlFor="password">Kata sandi</FieldLabel><InputGroup><InputGroupInput id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Masukkan kata sandi" aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : undefined} disabled={isSubmitting} {...register('password')} /><InputGroupAddon align="inline-end"><InputGroupButton size="icon-sm" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</InputGroupButton></InputGroupAddon></InputGroup>{errors.password && <FieldError id="password-error">{errors.password.message}</FieldError>}</Field>
    </FieldGroup>
    <Button type="submit" size="lg" className="login-submit w-full" disabled={isSubmitting}>{isSubmitting ? <><LoaderCircle className="animate-spin" data-icon="inline-start" />Menghubungkan...</> : <>Masuk ke workspace<ArrowRight data-icon="inline-end" /></>}</Button>
  </form>;
}

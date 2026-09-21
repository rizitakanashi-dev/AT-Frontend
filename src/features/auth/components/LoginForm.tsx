import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff, LoaderCircle, AlertCircle, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldGroup, FieldError } from '@/components/ui/field';
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from '@/components/ui/input-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginSchema, type LoginFormValues } from '../schemas/loginSchema';

export function LoginForm({ onSubmit, errorMsg }: { onSubmit: (data: LoginFormValues) => Promise<void>; errorMsg: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({ 
    resolver: zodResolver(loginSchema), 
    defaultValues: { nama: '', password: '' } 
  });

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {errorMsg && (
        <Alert variant="destructive" className="py-2.5">
          <AlertCircle className="size-4" />
          <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
        </Alert>
      )}

      <FieldGroup className="gap-4">
        <Field data-invalid={!!errors.nama}>
          <FieldLabel htmlFor="nama" className="text-xs font-medium text-foreground">
            Nama Pengguna
          </FieldLabel>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input 
              id="nama" 
              autoComplete="username" 
              placeholder="Contoh: rexia / admin" 
              className="pl-9.5 text-sm h-10.5 rounded-lg border-border focus:border-emerald-500 focus:ring-emerald-500/20"
              aria-invalid={!!errors.nama} 
              aria-describedby={errors.nama ? 'nama-error' : undefined} 
              disabled={isSubmitting} 
              {...register('nama')} 
            />
          </div>
          {errors.nama && <FieldError id="nama-error">{errors.nama.message}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password" className="text-xs font-medium text-foreground">
            Kata Sandi
          </FieldLabel>
          <InputGroup className="h-10.5 rounded-lg border-border focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
            <InputGroupAddon align="inline-start" className="pl-3">
              <Lock className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput 
              id="password" 
              type={showPassword ? 'text' : 'password'} 
              autoComplete="current-password" 
              placeholder="Masukkan kata sandi" 
              className="text-sm pl-2"
              aria-invalid={!!errors.password} 
              aria-describedby={errors.password ? 'password-error' : undefined} 
              disabled={isSubmitting} 
              {...register('password')} 
            />
            <InputGroupAddon align="inline-end" className="pr-1.5">
              <InputGroupButton 
                size="icon-sm" 
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} 
                aria-pressed={showPassword} 
                onClick={() => setShowPassword(!showPassword)}
                className="hover:bg-muted text-muted-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {errors.password && <FieldError id="password-error">{errors.password.message}</FieldError>}
        </Field>
      </FieldGroup>

      <Button 
        type="submit" 
        size="lg" 
        className="w-full h-11 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/20 transition-all active:scale-[0.99]" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="animate-spin size-4 mr-2" />
            <span>Memverifikasi akun...</span>
          </>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span>Masuk ke Workspace</span>
            <ArrowRight className="size-4" />
          </span>
        )}
      </Button>
    </form>
  );
}

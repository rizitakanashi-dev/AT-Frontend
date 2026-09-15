import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { loginSchema, LoginFormValues } from '../schemas/loginSchema';

interface LoginFormProps {
  onSubmit: (data: LoginFormValues) => Promise<void>;
  errorMsg: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, errorMsg }) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { nama: '', password: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {errorMsg && (
        <div className="rounded-lg p-3 text-sm" style={{ backgroundColor: 'rgba(255,77,77,0.08)', color: '#FF6B6B', border: '1px solid rgba(255,77,77,0.2)' }}>
          {errorMsg}
        </div>
      )}

      {/* Nama Field */}
      <div className="space-y-2">
        <Label className="text-xs font-medium" style={{ color: '#8A8F99' }}>
          Nama
        </Label>
        <div className="relative flex items-center">
          <User className="absolute left-3.5 h-4 w-4 pointer-events-none z-10" style={{ color: '#8A8F99' }} />
          <Input
            {...register('nama')}
            placeholder="Nama pengguna"
            className="h-11 pl-10 text-sm"
            style={{ backgroundColor: '#1E2024', color: '#FFFFFF', border: '1px solid #2D3036' }}
          />
        </div>
        {errors.nama && <p className="text-xs" style={{ color: '#FF6B6B' }}>{errors.nama.message}</p>}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label className="text-xs font-medium" style={{ color: '#8A8F99' }}>
          Password
        </Label>
        <div className="relative flex items-center">
          <Lock className="absolute left-3.5 h-4 w-4 pointer-events-none z-10" style={{ color: '#8A8F99' }} />
          <Input
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            placeholder="••••••••"
            className="h-11 pl-10 pr-10 text-sm"
            style={{ backgroundColor: '#1E2024', color: '#FFFFFF', border: '1px solid #2D3036' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 transition-colors" style={{ color: '#8A8F99' }}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs" style={{ color: '#FF6B6B' }}>{errors.password.message}</p>}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-6 text-sm font-semibold"
        style={{ backgroundColor: '#10B981', color: '#121316', borderRadius: '0.75rem' }}
      >
        <span>{isSubmitting ? 'Memproses...' : 'Masuk'}</span>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
};
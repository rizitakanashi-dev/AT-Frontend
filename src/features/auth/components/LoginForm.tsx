import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

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
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { nama: '', password: '', rememberMe: false },
  });

  return (
    <Card className="border-slate-100 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 rounded-2xl">
      <CardContent className="p-8">
        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email / Nama Field */}
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Email Address / Nama
            </Label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none z-10" />
              <Input
                {...register('nama')}
                placeholder="nama@domain.com"
                className="pl-10 font-mono text-sm bg-slate-100/70 dark:bg-slate-800"
              />
            </div>
            {errors.nama && <p className="text-xs text-red-500 font-mono">{errors.nama.message}</p>}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Password
            </Label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none z-10" />
              <Input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••"
                className="pl-10 pr-10 font-mono text-sm bg-slate-100/70 dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 font-mono">{errors.password.message}</p>}
          </div>

          {/* Checkbox Remember Me */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={watch('rememberMe')}
              onCheckedChange={(checked) => setValue('rememberMe', Boolean(checked))}
            />
            <Label htmlFor="rememberMe" className="font-mono text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              Remember me for 30 days
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-mono text-sm py-6 rounded-xl flex items-center justify-center space-x-2"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Login to Workspace_'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

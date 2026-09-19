"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { createClient } from "@/lib/supabase/client";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations/auth-schema";

export default function RecuperarSenhaPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/atualizar-senha`,
      });

      if (error) {
        toast.error("Erro ao enviar email", {
          description: error.message,
        });
        return;
      }

      setSent(true);
    } catch (err) {
      console.error("[ForgotPassword] Erro:", err);
      toast.error("Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Card className="border-border/60 shadow-lg">
        <CardContent className="pt-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Email enviado!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enviamos um link de recuperação para{" "}
              <span className="font-medium text-foreground">
                {getValues("email")}
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Verifique sua caixa de entrada e a pasta de spam. O link expira em
              1 hora.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o login
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader className="space-y-4 pb-6 text-center">
        <Link href="/" className="mx-auto inline-flex items-center">
          <Image
            src="/logo_.png"
            alt="Wancar Veículos"
            width={200}
            height={56}
            className="h-14 w-auto object-contain"
            priority
          />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Recuperar senha</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Digite seu email para receber o link de redefinição
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="pl-10 h-11"
                autoComplete="email"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-11"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar link de recuperação"
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            <Link
              href="/login"
              className="hover:text-foreground transition-colors"
            >
              ← Voltar para o login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
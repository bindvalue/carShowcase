"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { createClient } from "@/lib/supabase/client";
import {
  newPasswordSchema,
  type NewPasswordFormData,
} from "@/lib/validations/auth-schema";

export default function AtualizarSenhaPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (data: NewPasswordFormData) => {
    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) {
        toast.error("Erro ao atualizar senha", {
          description:
            "O link pode ter expirado. Solicite um novo email de recuperação.",
        });
        return;
      }

      setSuccess(true);
      toast.success("Senha atualizada com sucesso!");

      // Redireciona para login após 3 segundos
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      console.error("[UpdatePassword] Erro:", err);
      toast.error("Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-border/60 shadow-lg">
        <CardContent className="pt-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Senha atualizada!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sua nova senha foi definida com sucesso.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Redirecionando para o login...
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href="/login">Ir para o login agora</Link>
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
          <h1 className="text-xl font-bold">Definir nova senha</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolha uma senha forte para proteger sua conta
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                className="pl-10 pr-10 h-11"
                placeholder="••••••••"
                {...register("newPassword")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-destructive">
                {errors.newPassword.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Mínimo 8 caracteres, com letra maiúscula, minúscula e número.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                className="pl-10 h-11"
                placeholder="••••••••"
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
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
                Salvando...
              </>
            ) : (
              "Definir nova senha"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
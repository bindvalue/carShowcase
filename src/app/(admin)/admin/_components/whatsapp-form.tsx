"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "@/lib/zod";
import { Loader2, Save, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";

const schema = z.object({
  whatsapp_enabled: z.boolean(),
  whatsapp_number: z.string().optional().nullable(),
  whatsapp_message: z.string().optional().nullable(),
  whatsapp_label: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

export function WhatsAppForm() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { whatsapp_enabled: true },
  });

  useEffect(() => {
    if (settings) {
      reset({
        whatsapp_enabled: settings.whatsapp_enabled === "true",
        whatsapp_number: settings.whatsapp_number ?? "",
        whatsapp_message: settings.whatsapp_message ?? "",
        whatsapp_label: settings.whatsapp_label ?? "",
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: FormData) => {
    updateMutation.mutate({
      whatsapp_enabled: String(data.whatsapp_enabled),
      whatsapp_number: data.whatsapp_number || null,
      whatsapp_message: data.whatsapp_message || null,
      whatsapp_label: data.whatsapp_label || null,
    });
  };

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-lg bg-muted" />;
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-green-600" />
          WhatsApp Flutuante
        </CardTitle>
        <CardDescription>
          BotÃƒÂ£o de contato exibido em todas as pÃƒÂ¡ginas do site.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Toggle habilitar */}
          <Controller
            name="whatsapp_enabled"
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium text-sm">
                    Exibir botÃƒÂ£o flutuante
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Quando ativo, aparece um botÃƒÂ£o de WhatsApp no canto
                    inferior direito de todas as pÃƒÂ¡ginas.
                  </p>
                </div>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">NÃƒÂºmero (com DDI)</Label>
              <Input
                id="whatsapp_number"
                placeholder="5531993908081"
                className="h-11"
                {...register("whatsapp_number")}
              />
              <p className="text-xs text-muted-foreground">
                Formato: 55 + DDD + nÃƒÂºmero (sem espaÃƒÂ§os ou traÃƒÂ§os)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_label">RÃƒÂ³tulo do botÃƒÂ£o</Label>
              <Input
                id="whatsapp_label"
                placeholder="Fale conosco"
                className="h-11"
                {...register("whatsapp_label")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp_message">Mensagem inicial</Label>
            <Textarea
              id="whatsapp_message"
              placeholder="OlÃƒÂ¡! Vi o site e gostaria de mais informaÃƒÂ§ÃƒÂµes."
              rows={3}
              {...register("whatsapp_message")}
            />
            <p className="text-xs text-muted-foreground">
              Texto prÃƒÂ©-preenchido ao abrir a conversa no WhatsApp.
            </p>
          </div>

          <div className="flex justify-end pt-2 border-t">
            <Button
              type="submit"
              disabled={updateMutation.isPending || !isDirty}
              className="h-11 min-w-[160px]"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar WhatsApp
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
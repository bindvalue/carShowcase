"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "@/lib/zod";
import { Loader2, Save, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";

const schema = z.object({
  contact_phone: z.string().optional().nullable(),
  contact_whatsapp: z.string().optional().nullable(),
  contact_email: z
    .string()
    .email("Email invÃ¡lido")
    .optional()
    .nullable()
    .or(z.literal("")),
  contact_address_street: z.string().optional().nullable(),
  contact_address_city: z.string().optional().nullable(),
  contact_address_state: z.string().max(2).optional().nullable(),
  contact_address_zip: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

export function ContactForm() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (settings) {
      reset({
        contact_phone: settings.contact_phone ?? "",
        contact_whatsapp: settings.contact_whatsapp ?? "",
        contact_email: settings.contact_email ?? "",
        contact_address_street: settings.contact_address_street ?? "",
        contact_address_city: settings.contact_address_city ?? "",
        contact_address_state: settings.contact_address_state ?? "",
        contact_address_zip: settings.contact_address_zip ?? "",
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: FormData) => {
    updateMutation.mutate({
      contact_phone: data.contact_phone || null,
      contact_whatsapp: data.contact_whatsapp || null,
      contact_email: data.contact_email || null,
      contact_address_street: data.contact_address_street || null,
      contact_address_city: data.contact_address_city || null,
      contact_address_state: data.contact_address_state || null,
      contact_address_zip: data.contact_address_zip || null,
    });
  };

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-lg bg-muted" />;
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Phone className="h-4 w-4 text-primary" />
          Contato e LocalizaÃ§Ã£o
        </CardTitle>
        <CardDescription>
          InformaÃ§Ãµes exibidas no rodapÃ© e na pÃ¡gina de contato.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Telefone fixo</Label>
              <Input
                id="contact_phone"
                placeholder="(31) 2557-3849"
                className="h-11"
                {...register("contact_phone")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_whatsapp">WhatsApp</Label>
              <Input
                id="contact_whatsapp"
                placeholder="+55 31 99390-8081"
                className="h-11"
                {...register("contact_whatsapp")}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="contact_email">Email</Label>
              <Input
                id="contact_email"
                type="email"
                placeholder="contato@sualoja.com.br"
                className="h-11"
                {...register("contact_email")}
              />
              {errors.contact_email && (
                <p className="text-xs text-destructive">
                  {errors.contact_email.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              EndereÃ§o
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contact_address_street">Rua e nÃºmero</Label>
                <Input
                  id="contact_address_street"
                  placeholder="Rua Mato Grosso, 349"
                  className="h-11"
                  {...register("contact_address_street")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_address_city">Cidade</Label>
                <Input
                  id="contact_address_city"
                  placeholder="Contagem"
                  className="h-11"
                  {...register("contact_address_city")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_address_state">UF</Label>
                  <Input
                    id="contact_address_state"
                    placeholder="MG"
                    maxLength={2}
                    className="h-11 uppercase"
                    {...register("contact_address_state")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_address_zip">CEP</Label>
                  <Input
                    id="contact_address_zip"
                    placeholder="32073-760"
                    className="h-11"
                    {...register("contact_address_zip")}
                  />
                </div>
              </div>
            </div>
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
                  Salvar contato
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
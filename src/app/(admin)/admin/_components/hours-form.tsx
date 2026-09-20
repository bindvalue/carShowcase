"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "@/lib/zod";
import { Loader2, Save, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  hours_weekdays_open: z.string(),
  hours_weekdays_close: z.string(),
  hours_saturday_open: z.string(),
  hours_saturday_close: z.string(),
  hours_sunday_closed: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export function HoursForm() {
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
    defaultValues: {
      hours_weekdays_open: "08:00",
      hours_weekdays_close: "18:00",
      hours_saturday_open: "08:00",
      hours_saturday_close: "12:00",
      hours_sunday_closed: true,
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        hours_weekdays_open: settings.hours_weekdays_open ?? "08:00",
        hours_weekdays_close: settings.hours_weekdays_close ?? "18:00",
        hours_saturday_open: settings.hours_saturday_open ?? "08:00",
        hours_saturday_close: settings.hours_saturday_close ?? "12:00",
        hours_sunday_closed: settings.hours_sunday_closed !== "false",
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: FormData) => {
    updateMutation.mutate({
      hours_weekdays_open: data.hours_weekdays_open,
      hours_weekdays_close: data.hours_weekdays_close,
      hours_saturday_open: data.hours_saturday_open,
      hours_saturday_close: data.hours_saturday_close,
      hours_sunday_closed: String(data.hours_sunday_closed),
    });
  };

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-lg bg-muted" />;
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Horário de Funcionamento
        </CardTitle>
        <CardDescription>
          Exibido no rodapé do site.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* Segunda a Sexta */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
              <div>
                <Label className="text-sm font-medium">Segunda a Sexta</Label>
                <div className="text-xs text-muted-foreground mt-1">
                  Horário de abertura
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  className="h-11 w-32"
                  {...register("hours_weekdays_open")}
                />
                <span className="text-muted-foreground">à s</span>
                <Input
                  type="time"
                  className="h-11 w-32"
                  {...register("hours_weekdays_close")}
                />
              </div>
              <div />
            </div>

            {/* Sábado */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
              <div>
                <Label className="text-sm font-medium">Sábado</Label>
                <div className="text-xs text-muted-foreground mt-1">
                  Horário de abertura
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  className="h-11 w-32"
                  {...register("hours_saturday_open")}
                />
                <span className="text-muted-foreground">à s</span>
                <Input
                  type="time"
                  className="h-11 w-32"
                  {...register("hours_saturday_close")}
                />
              </div>
              <div />
            </div>

            {/* Domingo */}
            <Controller
              name="hours_sunday_closed"
              control={control}
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium">Domingo</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {field.value
                        ? "Fechado"
                        : "Aberto (configure o horário no admin)"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {field.value ? "Fechado" : "Aberto"}
                    </span>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                </div>
              )}
            />
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
                  Salvar horários
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
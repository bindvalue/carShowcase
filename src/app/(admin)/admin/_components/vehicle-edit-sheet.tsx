"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColorCombobox } from "@/components/ui/color-combobox";
import { z } from "@/lib/zod";
import {
  Loader2,
  Save,
  Car,
  Motorbike,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateOrSelectCombobox } from "@/components/ui/create-or-select-combobox";
import { cn } from "@/lib/utils";

import {
  useUpdateVeiculo,
  useUploadVeiculoImagem,
  useUploadMultiplasImagens,
} from "@/hooks/use-update-veiculo";
import { useCreateVeiculo } from "@/hooks/use-admin-veiculos";
import {
  useMarcas,
  useModelos,
  useCores,
  useCreateMarca,
  useCreateModelo,
  useCreateCor,
  useMotores,
  useCreateMotor,
} from "@/hooks/use-catalogos";
import { CAMBIO_OPTIONS, COMBUSTIVEL_OPTIONS } from "@/lib/constants";
import { parseOpcionais } from "@/lib/formatters";
import { VehicleImagesManager } from "./vehicle-images-manager";
import { VehicleOpcionaisManager } from "./vehicle-opcionais-manager";
import type { Veiculo } from "@/types/veiculo";

// ==========================================
// SCHEMA DE VALIDAÃƒâ€¡ÃƒÆ’O
// ==========================================

const veiculoSchema = z.object({
  marca: z.string().min(1, "Marca ÃƒÂ© obrigatÃƒÂ³ria"),
  modelo: z.string().min(1, "Modelo ÃƒÂ© obrigatÃƒÂ³rio"),
  ano: z.coerce
    .number()
    .min(1900, "Ano invÃƒÂ¡lido")
    .max(new Date().getFullYear() + 1, "Ano invÃƒÂ¡lido"),
  preco: z.coerce.number().min(0, "PreÃƒÂ§o invÃƒÂ¡lido"),
  km: z.coerce.number().min(0).nullable().optional(),
  tipo: z.enum(["carro", "moto"]),
  cor: z.string().optional().nullable(),
  combustivel: z.string().optional().nullable(),
  cambio: z.string().optional().nullable(),
  descricao: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  whatsapp_link: z.string().optional().nullable(),
  ativo: z.boolean(),
  motor: z.string().optional().nullable(),
  placa: z
    .string()
    .optional()
    .nullable()
    .transform((v) =>
      v ? v.toUpperCase().replace(/[^A-Z0-9]/g, "") : null
    )
    .refine(
      (v) => !v || v.length === 7,
      "Placa deve ter 7 caracteres (ex: ABC1234 ou ABC1D23)"
    ),

  opcionais: z.array(z.string()).default([]),

  imagem_capa_temp: z.string().nullable().optional(),
  imagens_temp: z.array(z.string()).default([]),
});

// Input: o que o form RECEBE (antes do Zod transformar)
type VeiculoFormInput = z.input<typeof veiculoSchema>;

// Output: o que o onSubmit RECEBE (depois do Zod transformar)
type VeiculoFormData = z.output<typeof veiculoSchema>;

// ==========================================
// PROPS
// ==========================================

interface VehicleEditModalProps {
  veiculo: Veiculo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ==========================================
// COMPONENTE
// ==========================================

export function VehicleEditModal({
  veiculo,
  open,
  onOpenChange,
}: VehicleEditModalProps) {
  const isCreating = !veiculo;

  const updateMutation = useUpdateVeiculo();
  const createMutation = useCreateVeiculo();
  const uploadMultiploMutation = useUploadMultiplasImagens();

  const createMarcaMutation = useCreateMarca();
  const createModeloMutation = useCreateModelo();
  const createCorMutation = useCreateCor();
  const createMotorMutation = useCreateMotor();

  const [novaImagem, setNovaImagem] = useState<string | null>(null);
  const [imagens, setImagens] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [marcaIdSelecionada, setMarcaIdSelecionada] = useState<string>("");

  const { data: marcas = [] } = useMarcas();
  const { data: modelos = [] } = useModelos(marcaIdSelecionada || undefined);
  const { data: cores = [] } = useCores();
  const { data: motores = [] } = useMotores();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<VeiculoFormInput>({
    resolver: zodResolver(veiculoSchema),
    defaultValues: {
      marca: "",
      modelo: "",
      ano: new Date().getFullYear(),
      preco: 0,
      km: null,
      tipo: "carro",
      cor: "",
      combustivel: "",
      cambio: "",
      descricao: "",
      cidade: "Contagem",
      estado: "MG",
      whatsapp_link: "",
      ativo: true,
      placa: "",
      opcionais: [],
      imagem_capa_temp: null,
      imagens_temp: [],
      motor: "",
    },
  });

  const tipoAtual = watch("tipo");

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Preenche o form Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  useEffect(() => {
    if (!open) return;

    if (veiculo) {
      // MODO EDIÃƒâ€¡ÃƒÆ’O
      reset({
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        ano: veiculo.ano,
        preco: veiculo.preco,
        km: veiculo.km,
        tipo: veiculo.tipo,
        cor: veiculo.cor ?? "",
        combustivel: veiculo.combustivel ?? "",
        cambio: veiculo.cambio ?? "",
        descricao: veiculo.descricao ?? "",
        cidade: veiculo.cidade ?? "Contagem",
        estado: veiculo.estado ?? "MG",
        whatsapp_link: veiculo.whatsapp_link ?? "",
        ativo: !!veiculo.ativo,
        placa: veiculo.placa ?? "",
        opcionais: parseOpcionais(veiculo.opcionais),
        imagem_capa_temp: veiculo.imagem_capa,
        imagens_temp: veiculo.imagens ?? [],
        motor: veiculo.motor ?? "",
      });

      setNovaImagem(veiculo.imagem_capa);
      setImagens(veiculo.imagens ?? []);
      setPendingFiles([]);

      const marca = marcas.find((m) => m.nome === veiculo.marca);
      setMarcaIdSelecionada(marca?.id ?? "");
    } else {
      // MODO CRIAÃƒâ€¡ÃƒÆ’O Ã¢â‚¬â€ valores padrÃƒÂ£o
      reset({
        marca: "",
        modelo: "",
        ano: new Date().getFullYear(),
        preco: 0,
        km: null,
        tipo: "carro",
        cor: "",
        combustivel: "Flex",
        cambio: "Automatico",
        descricao: "",
        cidade: "Contagem",
        estado: "MG",
        whatsapp_link: "",
        ativo: true,
        placa: "",
        opcionais: [],
        imagem_capa_temp: null,
        imagens_temp: [],
        motor: "",
      });

      setNovaImagem(null);
      setImagens([]);
      setPendingFiles([]);
      setMarcaIdSelecionada("");
    }
  }, [veiculo, open, reset, marcas]);

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ SUBMIT Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const onSubmit = async (data: VeiculoFormInput) => {
  // Ã¢Å¡Â¡ Converte o input para output (o Zod jÃƒÂ¡ validou, entÃƒÂ£o ÃƒÂ© seguro)
  const parsed = veiculoSchema.parse(data) as VeiculoFormData;

  // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â CRIAÃƒâ€¡ÃƒÆ’O Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
  if (isCreating) {
    try {
      const novoVeiculo = await createMutation.mutateAsync({
        marca: parsed.marca,
        modelo: parsed.modelo,
        ano: parsed.ano,
        preco: parsed.preco,
        km: parsed.km ?? null,
        tipo: parsed.tipo,
        cor: parsed.cor || null,
        combustivel: parsed.combustivel || null,
        cambio: parsed.cambio || null,
        descricao: parsed.descricao || null,
        cidade: parsed.cidade || null,
        estado: parsed.estado || null,
        whatsapp_link: parsed.whatsapp_link || null,
        ativo: parsed.ativo,
        placa: parsed.placa || null,
        opcionais: parsed.opcionais ?? [],
        imagem_capa: null,
        imagens: [],
        motor: parsed.motor || null,
      });

      if (pendingFiles.length > 0) {
        const uploadResult = await uploadMultiploMutation.mutateAsync({
          veiculoId: novoVeiculo.id,
          files: pendingFiles,
        });

        await updateMutation.mutateAsync({
          id: novoVeiculo.id,
          dados: {
            imagem_capa: uploadResult[0] ?? null,
            imagens: uploadResult,
          },
        });

        toast.success(
          `${uploadResult.length} ${
            uploadResult.length === 1 ? "foto enviada" : "fotos enviadas"
          }!`
        );
      }

      onOpenChange(false);
      reset();
      setNovaImagem(null);
      setImagens([]);
      setPendingFiles([]);
      setMarcaIdSelecionada("");
    } catch {
      // erros tratados nos hooks
    }
    return;
  }

  // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â EDIÃƒâ€¡ÃƒÆ’O Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
  if (!veiculo) return;

  await updateMutation.mutateAsync({
    id: veiculo.id,
    dados: {
      marca: parsed.marca,
      modelo: parsed.modelo,
      ano: parsed.ano,
      preco: parsed.preco,
      km: parsed.km ?? null,
      tipo: parsed.tipo,
      cor: parsed.cor || null,
      combustivel: parsed.combustivel || null,
      cambio: parsed.cambio || null,
      descricao: parsed.descricao || null,
      cidade: parsed.cidade || null,
      estado: parsed.estado || null,
      whatsapp_link: parsed.whatsapp_link || null,
      ativo: parsed.ativo,
      placa: parsed.placa || null,
      opcionais: parsed.opcionais ?? [],
      imagem_capa: novaImagem,
      imagens: imagens,
      motor: parsed.motor || null,
    },
  });

  onOpenChange(false);
};

  const isPending =
    updateMutation.isPending ||
    createMutation.isPending ||
    uploadMultiploMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "!max-w-5xl w-[95vw] p-0 gap-0 flex flex-col",
          "h-[90vh] max-h-[90vh]",
          "overflow-hidden"
        )}
      >
        {/* HEADER */}
        <DialogHeader className="px-8 py-6 border-b shrink-0">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            {isCreating ? "Novo veÃƒÂ­culo" : "Editar veÃƒÂ­culo"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {isCreating
              ? "Preencha os dados. As fotos serÃƒÂ£o enviadas ao cadastrar."
              : `${veiculo?.marca} ${veiculo?.modelo} Ã‚Â· ${veiculo?.ano}`}
          </DialogDescription>
        </DialogHeader>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="px-8 py-8 space-y-10">
              {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â FOTOS DO VEÃƒÂCULO Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
              <section>
                <SectionTitle>Fotos do veÃƒÂ­culo</SectionTitle>
                <p className="mt-2 text-xs text-muted-foreground">
                  {isCreating
                    ? "Selecione as fotos e defina qual serÃƒÂ¡ a capa. Elas serÃƒÂ£o enviadas ao cadastrar."
                    : "Adicione, remova ou defina a capa entre as fotos do veÃƒÂ­culo."}
                </p>
                <div className="mt-4">
                  <VehicleImagesManager
                    veiculoId={veiculo?.id ?? null}
                    imagens={imagens}
                    capaAtual={novaImagem}
                    pendingFiles={pendingFiles}
                    onPendingFilesChange={setPendingFiles}
                    onChange={(novasImagens, novaCapa) => {
                      setImagens(novasImagens);
                      setNovaImagem(novaCapa);
                      setValue("imagem_capa_temp", novaCapa, {
                        shouldDirty: true,
                      });
                      setValue("imagens_temp", novasImagens, {
                        shouldDirty: true,
                      });
                    }}
                  />
                </div>
              </section>

              <Separator />

              {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â TIPO E STATUS Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
              <section>
                <SectionTitle>Tipo e status</SectionTitle>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Tipo de veÃƒÂ­culo" required>
                    <Controller
                      name="tipo"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="h-11 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="carro">
                              <span className="flex items-center gap-2">
                                <Car className="h-4 w-4" />
                                Carro
                              </span>
                            </SelectItem>
                            <SelectItem value="moto">
                              <span className="flex items-center gap-2">
                                <Motorbike className="h-4 w-4" />
                                Moto
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>

                  <FormField label="Status do anÃƒÂºncio">
                    <Controller
                      name="ativo"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center gap-3 h-11 rounded-md border px-3 bg-background">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">
                            {field.value ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                      )}
                    />
                  </FormField>
                </div>
              </section>

              <Separator />

              {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â DADOS BÃƒÂSICOS Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
              <section>
                <SectionTitle>Dados bÃƒÂ¡sicos</SectionTitle>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Marca" required error={errors.marca?.message}>
                    <Controller
                      name="marca"
                      control={control}
                      render={({ field }) => (
                        <CreateOrSelectCombobox
                          options={marcas.map((m) => ({
                            value: m.nome,
                            label: m.nome,
                          }))}
                          value={field.value}
                          onChange={(v) => {
                            field.onChange(v);
                            setValue("modelo", "", { shouldDirty: true });
                            const marca = marcas.find((m) => m.nome === v);
                            setMarcaIdSelecionada(marca?.id ?? "");
                          }}
                          onCreate={async (nome) => {
                            try {
                              const nova =
                                await createMarcaMutation.mutateAsync(nome);
                              setMarcaIdSelecionada(nova.id);
                              return nova.nome;
                            } catch {
                              return null;
                            }
                          }}
                          creating={createMarcaMutation.isPending}
                          placeholder="Selecione a marca"
                          searchPlaceholder="Buscar marca..."
                          createLabel="Criar marca"
                          emptyText="Nenhuma marca encontrada"
                        />
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Modelo"
                    required
                    error={errors.modelo?.message}
                  >
                    <Controller
                      name="modelo"
                      control={control}
                      render={({ field }) => (
                        <CreateOrSelectCombobox
                          options={modelos.map((m) => ({
                            value: m.nome,
                            label: m.nome,
                          }))}
                          value={field.value}
                          onChange={field.onChange}
                          onCreate={async (nome) => {
                            if (!marcaIdSelecionada) {
                              toast.error("Selecione uma marca primeiro");
                              return null;
                            }
                            try {
                              const novo =
                                await createModeloMutation.mutateAsync({
                                  nome,
                                  marcaId: marcaIdSelecionada,
                                });
                              return novo.nome;
                            } catch {
                              return null;
                            }
                          }}
                          creating={createModeloMutation.isPending}
                          placeholder={
                            marcaIdSelecionada
                              ? "Selecione o modelo"
                              : "Escolha a marca primeiro"
                          }
                          searchPlaceholder="Buscar modelo..."
                          createLabel="Criar modelo"
                          emptyText="Nenhum modelo encontrado"
                          disabled={!marcaIdSelecionada}
                        />
                      )}
                    />
                  </FormField>

                  <FormField label="Motor / VersÃƒÂ£o" error={errors.motor?.message}>
                    <Controller
                      name="motor"
                      control={control}
                      render={({ field }) => (
                        <CreateOrSelectCombobox
                          options={motores.map((m) => ({
                            value: m.nome,
                            label: m.nome,
                          }))}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onCreate={async (nome) => {
                            try {
                              const novo =
                                await createMotorMutation.mutateAsync(nome);
                              return novo.nome;
                            } catch {
                              return null;
                            }
                          }}
                          creating={createMotorMutation.isPending}
                          placeholder="Selecione o motor"
                          searchPlaceholder="Buscar motor..."
                          createLabel="Criar motor"
                          emptyText="Nenhum motor encontrado"
                        />
                      )}
                    />
                  </FormField>

                  <FormField label="Ano" required error={errors.ano?.message}>
                    <Input
                      type="number"
                      className="h-11"
                      {...register("ano")}
                    />
                  </FormField>

                  <FormField label="Quilometragem">
                    <Input
                      type="number"
                      placeholder="Ex: 45000"
                      className="h-11"
                      {...register("km")}
                    />
                  </FormField>

                  <FormField
                    label="PreÃƒÂ§o (R$)"
                    required
                    error={errors.preco?.message}
                  >
                    <Input
                      type="number"
                      step="0.01"
                      className="h-11"
                      {...register("preco")}
                    />
                  </FormField>

                  <FormField label="Cor">
                    <Controller
                      name="cor"
                      control={control}
                      render={({ field }) => (
                        <ColorCombobox
                          cores={cores}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onCreate={async (nome, hex) => {
                            try {
                              const nova = await createCorMutation.mutateAsync({ nome, hex });
                              return nova.nome;
                            } catch {
                              return null;
                            }
                          }}
                          creating={createCorMutation.isPending}
                          placeholder="Selecione a cor"
                        />
                      )}
                    />
                  </FormField>

                  <FormField label="Placa" error={errors.placa?.message}>
                    <Input
                      placeholder="ABC1234 ou ABC1D23"
                      className="h-11 uppercase font-mono tracking-wider"
                      maxLength={8}
                      {...register("placa")}
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      SÃƒÂ³ os 3 ÃƒÂºltimos dÃƒÂ­gitos serÃƒÂ£o exibidos na vitrine.
                    </p>
                  </FormField>
                </div>
              </section>

              <Separator />

              {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â ESPECIFICAÃƒâ€¡Ãƒâ€¢ES Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
              <section>
                <SectionTitle>EspecificaÃƒÂ§ÃƒÂµes</SectionTitle>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="CÃƒÂ¢mbio">
                    <Controller
                      name="cambio"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value ?? ""}
                          onValueChange={field.onChange}
                        >
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                          <SelectContent>
                            {CAMBIO_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>

                  <FormField label="CombustÃƒÂ­vel">
                    <Controller
                      name="combustivel"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value ?? ""}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="h-11 w-full">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {COMBUSTIVEL_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>

                  <FormField label="Cidade">
                    <Input
                      className="h-11"
                      placeholder="Ex: Contagem"
                      {...register("cidade")}
                    />
                  </FormField>

                  <FormField label="Estado (UF)">
                    <Input
                      maxLength={2}
                      placeholder="Ex: MG"
                      className="h-11 uppercase"
                      {...register("estado")}
                    />
                  </FormField>
                </div>
              </section>

              <Separator />

              {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â ITENS DO VEÃƒÂCULO Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
              <section>
                <SectionTitle>
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    Itens do veÃƒÂ­culo
                  </span>
                </SectionTitle>
                <p className="mt-2 text-xs text-muted-foreground">
                  Selecione os equipamentos inclusos. Se nÃƒÂ£o encontrar algum,
                  vocÃƒÂª pode criar um novo.
                </p>
                <div className="mt-4">
                  <Controller
                    name="opcionais"
                    control={control}
                    render={({ field }) => (
                      <VehicleOpcionaisManager
                        value={field.value ?? []}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </section>

              <Separator />

              {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â CONTATO E DESCRIÃƒâ€¡ÃƒÆ’O Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
              <section>
                <SectionTitle>Contato e descriÃƒÂ§ÃƒÂ£o</SectionTitle>
                <div className="mt-4 space-y-6">
                  <FormField label="WhatsApp (opcional)">
                    <Input
                      placeholder="Ex: 5531993908081"
                      className="h-11"
                      {...register("whatsapp_link")}
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Se vazio, usa o WhatsApp padrÃƒÂ£o do site.
                    </p>
                  </FormField>

                  <FormField label="DescriÃƒÂ§ÃƒÂ£o">
                    <Textarea
                      rows={5}
                      placeholder="Detalhes do veÃƒÂ­culo, histÃƒÂ³rico, opcionais..."
                      {...register("descricao")}
                    />
                  </FormField>
                </div>
              </section>
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t px-8 py-5 flex items-center justify-between gap-3 shrink-0 bg-muted/30">
            <p className="text-xs text-muted-foreground hidden sm:block">
              Campos com <span className="text-destructive">*</span> sÃƒÂ£o
              obrigatÃƒÂ³rios
            </p>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="h-11"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={isPending || (!isCreating && !isDirty)}
                className="min-w-[160px] h-11"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isCreating ? "Cadastrando..." : "Salvando..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isCreating ? "Cadastrar veÃƒÂ­culo" : "Salvar alteraÃƒÂ§ÃƒÂµes"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// AUXILIARES
// ==========================================

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      {children}
    </h3>
  );
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function FormField({
  label,
  required,
  error,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
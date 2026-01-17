// src/views/owners/CreateOwnerView.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Loader2, 
  User, 
  Mail, 
  MapPin, 
  CreditCard,
  UserPlus,
  Save,
  X
} from "lucide-react";
import { createOwner } from "../../api/OwnerAPI";
import { toast } from "../../components/Toast";
import { WhatsAppPhoneInput } from "../../components/WhatsAppPhoneInput";
import type { OwnerFormData } from "../../types/owner";

const initialFormData: OwnerFormData = {
  name: "",
  contact: "",
  email: "",
  address: "",
  nationalId: "",
};

export default function CreateOwnerView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<OwnerFormData>(initialFormData);
  const [phoneError, setPhoneError] = useState<string>("");

  const { mutate, isPending } = useMutation({
    mutationFn: createOwner,
    onSuccess: (data) => {
      toast.success('Propietario registrado', `El perfil de "${data.owner.name}" ha sido creado.`);
      queryClient.invalidateQueries({ queryKey: ["owners"] });
       navigate(`/owners/${data.owner._id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, contact: value }));
    setPhoneError("");
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone || phone.length < 10) {
      setPhoneError("El número de teléfono es obligatorio");
      return false;
    }
    
    const phoneRegex = /^\+[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError("Número de teléfono inválido");
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    if (!validatePhone(formData.contact)) {
      return;
    }

    const dataToSend: OwnerFormData = {
      name: formData.name.trim(),
      contact: formData.contact.trim(),
      email: formData.email?.trim() || null,
      address: formData.address?.trim() || null,
      nationalId: formData.nationalId?.trim() || null,
    };

    mutate(dataToSend);
  };

  const isValid = formData.name.trim() !== "" && formData.contact.length >= 10;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-vet-light p-4 lg:p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-sky-soft border border-vet-border hover:bg-vet-hover hover:border-vet-primary/30 text-vet-muted transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-vet-primary to-vet-secondary rounded-xl shadow-soft">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-vet-text">Nuevo Propietario</h1>
              <p className="text-sm text-vet-muted">Complete los datos del cliente</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="bg-sky-soft rounded-2xl border border-vet-border shadow-card overflow-hidden">
            
            {/* Grid de campos */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {/* Nombre - Ocupa más espacio */}
                <div className="lg:col-span-1">
                  <label className="flex items-center gap-2 text-sm font-semibold text-vet-text mb-2">
                    <div className="p-1 bg-vet-primary/10 rounded">
                      <User className="w-3.5 h-3.5 text-vet-primary" />
                    </div>
                    Nombre completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Juan Pérez"
                    maxLength={100}
                    className="w-full px-4 py-2.5 bg-vet-light border border-vet-border rounded-xl text-sm text-vet-text placeholder:text-vet-muted/50 focus:outline-none focus:bg-vet-light focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all"
                  />
                </div>

                {/* Teléfono WhatsApp */}
                <div className="lg:col-span-1">
                  <WhatsAppPhoneInput
                    value={formData.contact}
                    onChange={handlePhoneChange}
                    error={phoneError}
                    required
                  />
                </div>

                {/* Cédula/RIF */}
                <div className="lg:col-span-1">
                  <label className="flex items-center gap-2 text-sm font-semibold text-vet-text mb-2">
                    <div className="p-1 bg-purple-100 dark:bg-purple-900/20 rounded">
                      <CreditCard className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    </div>
                    Cédula / RIF
                  </label>
                  <input
                    type="text"
                    name="nationalId"
                    value={formData.nationalId || ""}
                    onChange={handleChange}
                    placeholder="12345678"
                    maxLength={20}
                    className="w-full px-4 py-2.5 bg-vet-light border border-vet-border rounded-xl text-sm text-vet-text placeholder:text-vet-muted/50 focus:outline-none focus:bg-vet-light focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all"
                  />
                </div>

                {/* Email */}
                <div className="lg:col-span-1">
                  <label className="flex items-center gap-2 text-sm font-semibold text-vet-text mb-2">
                    <div className="p-1 bg-blue-100 dark:bg-blue-900/20 rounded">
                      <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    placeholder="juan@email.com"
                    maxLength={100}
                    className="w-full px-4 py-2.5 bg-vet-light border border-vet-border rounded-xl text-sm text-vet-text placeholder:text-vet-muted/50 focus:outline-none focus:bg-vet-light focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all"
                  />
                </div>

                {/* Dirección - Ocupa 2 columnas */}
                <div className="lg:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-vet-text mb-2">
                    <div className="p-1 bg-amber-100 dark:bg-amber-900/20 rounded">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ""}
                    onChange={handleChange}
                    placeholder="Av. Principal, Edificio Centro, Piso 2, Apto 5"
                    maxLength={200}
                    className="w-full px-4 py-2.5 bg-vet-light border border-vet-border rounded-xl text-sm text-vet-text placeholder:text-vet-muted/50 focus:outline-none focus:bg-vet-light focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Footer con botones */}
            <div className="px-6 py-4 bg-vet-light/50 border-t border-vet-border flex items-center justify-between">
              <p className="text-xs text-vet-muted">
                <span className="text-red-500">*</span> Campos obligatorios
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm text-vet-muted font-medium rounded-xl border border-vet-border bg-sky-soft hover:bg-vet-hover hover:border-vet-primary/30 transition-all"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isValid || isPending}
                  className={`flex items-center gap-2 px-6 py-2.5 text-sm rounded-xl font-semibold transition-all ${
                    isValid && !isPending
                      ? "bg-gradient-to-r from-vet-primary to-vet-secondary hover:from-vet-secondary hover:to-vet-primary text-white shadow-soft hover:shadow-md"
                      : "bg-vet-light border border-vet-border text-vet-muted/50 cursor-not-allowed"
                  }`}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar Propietario
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
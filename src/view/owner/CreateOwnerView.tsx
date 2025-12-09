// src/views/owners/CreateOwnerView.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, User, Phone, Mail, MapPin, CreditCard } from "lucide-react";
import { createOwner } from "../../api/OwnerAPI";
import { toast } from "../../components/Toast";
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

  const { mutate, isPending } = useMutation({
    mutationFn: createOwner,
    onSuccess: () => {
      toast.success("Propietario registrado correctamente");
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      navigate("/owners");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    if (!formData.contact.trim()) {
      toast.error("El teléfono es obligatorio");
      return;
    }

    // Limpiar valores vacíos
    const dataToSend: OwnerFormData = {
      name: formData.name.trim(),
      contact: formData.contact.trim(),
      email: formData.email?.trim() || null,
      address: formData.address?.trim() || null,
      nationalId: formData.nationalId?.trim() || null,
    };

    mutate(dataToSend);
  };

  const isValid = formData.name.trim() !== "" && formData.contact.trim() !== "";

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Nuevo Propietario</h1>
            <p className="text-sm text-gray-500">Registrar datos del cliente</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm text-gray-600 font-medium rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            className={`px-4 py-2 text-sm rounded-lg font-medium flex items-center gap-2 transition-all ${
              isValid && !isPending
                ? "bg-vet-primary hover:bg-vet-secondary text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </button>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="space-y-5">
          {/* Nombre */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 text-gray-400" />
              Nombre completo *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Juan Pérez"
              maxLength={100}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 text-gray-400" />
              Teléfono *
            </label>
            <input
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Ej: 0414-1234567"
              maxLength={20}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>

          {/* Cédula/ID */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              Cédula / ID Nacional
            </label>
            <input
              type="text"
              name="nationalId"
              value={formData.nationalId || ""}
              onChange={handleChange}
              placeholder="Ej: V-12345678"
              maxLength={20}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 text-gray-400" />
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              placeholder="Ej: juan@email.com"
              maxLength={100}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              Dirección
            </label>
            <input
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              placeholder="Ej: Av. Principal, Edificio Centro, Piso 2"
              maxLength={200}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-vet-primary/20 focus:border-vet-primary"
            />
          </div>
        </div>

        {/* Nota */}
        <p className="mt-6 text-xs text-gray-400">
          * Campos obligatorios
        </p>
      </form>
    </div>
  );
}
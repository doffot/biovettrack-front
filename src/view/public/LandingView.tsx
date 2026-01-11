// src/view/public/LandingView.tsx
import React from "react";
import { Link } from "react-router-dom";
import Logo from "../../components/Logo";

const LandingView: React.FC = () => {
  const features = [
    { icon: "🐕", title: "Pacientes", desc: "Historial completo de cada mascota" },
    { icon: "👤", title: "Propietarios", desc: "Gestión de clientes y contactos" },
    { icon: "📅", title: "Citas", desc: "Agenda y recordatorios automáticos" },
    { icon: "🔬", title: "Laboratorio", desc: "Exámenes y resultados digitales" },
    { icon: "💉", title: "Vacunas", desc: "Control de vacunación y desparasitación" },
    { icon: "🛁", title: "Peluquería", desc: "Servicios de grooming" },
    { icon: "📦", title: "Inventario", desc: "Control de stock y productos" },
    { icon: "💰", title: "Ventas", desc: "Facturación y reportes" },
    { icon: "👥", title: "Personal", desc: "Gestión de empleados" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-vet-secondary via-vet-primary to-vet-secondary text-white font-montserrat">
      {/* Partículas decorativas */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-vet-accent/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-vet-light/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-vet-accent/5 rounded-full blur-3xl animate-morph" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <Logo 
          size="sm" 
          showText 
          layout="horizontal"
          textClassName="text-white"
        />
        <div className="flex gap-3">
          <Link
            to="/auth/login"
            className="px-5 py-2.5 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 border border-white/20 backdrop-blur-sm"
          >
            Iniciar Sesión
          </Link>
          <Link
            to="/auth/register"
            className="bg-vet-accent hover:bg-vet-accent/80 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-vet-accent/25 hidden sm:block"
          >
            Registrarse
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center py-20 px-6">
        <div className="animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-white/20">
            <span className="w-2 h-2 bg-vet-accent rounded-full animate-pulse" />
            <span className="text-sm text-vet-light">Sistema Veterinario Profesional</span>
          </div>

          {/* Logo grande central */}
          <div className="mb-8">
            <Logo 
              size="xl" 
              showText 
              showSubtitle
              layout="vertical"
              textClassName="text-white text-4xl md:text-5xl"
              subtitleClassName="text-vet-light/80"
            />
          </div>

          {/* Título principal */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="text-white">Gestión Veterinaria</span>
            <br />
            <span className="bg-gradient-to-r from-vet-accent to-vet-light bg-clip-text text-transparent">
              Inteligente y Moderna
            </span>
          </h2>

          {/* Subtítulo */}
          <p className="text-lg md:text-xl text-vet-light/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Administra pacientes, citas, exámenes de laboratorio, inventario, 
            peluquería y mucho más en una sola plataforma.
          </p>

          {/* Botones CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/register"
              className="group bg-vet-accent hover:bg-white text-vet-secondary hover:text-vet-primary px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Comenzar Gratis
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/auth/login"
              className="border-2 border-white/30 hover:border-white/60 hover:bg-white/10 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 backdrop-blur-sm"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        {/* Decoración visual con mascotas */}
        <div className="mt-16 relative">
          <div className="w-72 h-72 md:w-96 md:h-96 bg-gradient-to-br from-vet-accent/20 to-vet-light/10 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" />
          <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="grid grid-cols-3 gap-4">
              {["🐕", "🐈", "🐰", "🦜", "🐹", "🐢"].map((emoji, i) => (
                <div 
                  key={i} 
                  className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center text-3xl hover:scale-110 transition-transform cursor-pointer hover:bg-white/20"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {emoji}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Todo lo que necesitas
            </h3>
            <p className="text-vet-light/70 text-lg max-w-2xl mx-auto">
              Una suite completa de herramientas diseñada específicamente para clínicas veterinarias
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:border-vet-accent/50 hover:shadow-lg hover:shadow-vet-accent/10"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-vet-accent/20 to-vet-primary/20 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold mb-2 text-white">
                  {feature.title}
                </h4>
                <p className="text-vet-light/60">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "500+", label: "Clínicas activas" },
                { value: "50k+", label: "Pacientes registrados" },
                { value: "99.9%", label: "Uptime garantizado" },
                { value: "24/7", label: "Soporte técnico" },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl md:text-4xl font-bold text-vet-accent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-vet-light/60 text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Trust Section */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-12">
            Confían en BioVetTrack
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "BioVetTrack ha revolucionado la forma en que manejamos nuestra clínica.",
                author: "Dr. María González",
                role: "Veterinaria"
              },
              {
                quote: "El mejor sistema de gestión veterinaria que hemos usado.",
                author: "Dr. Carlos Ruiz",
                role: "Director Clínico"
              },
              {
                quote: "Fácil de usar y con todas las funciones que necesitamos.",
                author: "Dra. Ana Martínez",
                role: "Veterinaria"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <p className="text-vet-light/80 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-white">{testimonial.author}</p>
                  <p className="text-vet-accent text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <Logo 
            size="lg" 
            layout="horizontal"
            className="justify-center mb-8"
          />
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para modernizar tu clínica?
          </h3>
          <p className="text-vet-light/70 text-lg mb-8">
            Únete a cientos de veterinarios que ya confían en BioVetTrack para gestionar su práctica diaria.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/register"
              className="bg-white text-vet-primary hover:bg-vet-light px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Crear Cuenta Gratis
            </Link>
            <Link
              to="/auth/login"
              className="border-2 border-white/30 hover:border-white hover:bg-white/10 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Logo 
            size="sm" 
            showText 
            layout="horizontal"
            textClassName="text-white"
          />
          <p className="text-vet-light/50 text-sm text-center">
            © 2024 BioVetTrack - Sistema de Gestión Veterinaria. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-vet-light/50 text-sm">
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingView;
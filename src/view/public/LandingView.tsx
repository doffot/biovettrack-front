// src/view/public/LandingView.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  PawPrint, 
  Calendar, 
  FlaskConical, 
  Syringe, 
  Scissors, 
  Package, 
  ShoppingCart, 
  Users, 
  Stethoscope,
  ChevronRight,
  Shield,
  Zap,
  Clock,
  CheckCircle2,
  Play,
  Menu,
  X,
  ChevronLeft,
  Monitor
} from "lucide-react";

const LandingView: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-slide para las capturas
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % screenshots.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: PawPrint, title: "Pacientes", desc: "Historial clínico completo de cada mascota con seguimiento detallado" },
    { icon: Users, title: "Propietarios", desc: "Gestión integral de clientes, contactos y comunicación" },
    { icon: Calendar, title: "Citas", desc: "Agenda inteligente con recordatorios automáticos" },
    { icon: FlaskConical, title: "Laboratorio", desc: "Exámenes y resultados digitales en tiempo real" },
    { icon: Syringe, title: "Vacunas", desc: "Control completo de vacunación y desparasitación" },
    { icon: Scissors, title: "Peluquería", desc: "Servicios de grooming y estética canina" },
    { icon: Package, title: "Inventario", desc: "Control de stock, alertas y reabastecimiento" },
    { icon: ShoppingCart, title: "Ventas", desc: "Punto de venta integrado y facturación" },
    { icon: Stethoscope, title: "Consultas", desc: "Registro detallado de consultas médicas" },
  ];

  const screenshots = [
    { 
      src: "/img/panel-control.png", 
      title: "Panel de Control", 
      desc: "Vista general de tu clínica con estadísticas en tiempo real" 
    },
    { 
      src: "/img/detalles-mascota.png", 
      title: "Detalles de Mascota", 
      desc: "Historial clínico completo y seguimiento de cada paciente" 
    },
    { 
      src: "/img/punto-de-venta.png", 
      title: "Punto de Venta", 
      desc: "Sistema de facturación rápido e intuitivo" 
    },
    { 
      src: "/img/reportes-graficos.png", 
      title: "Reportes y Gráficos", 
      desc: "Análisis detallado del rendimiento de tu negocio" 
    },
  ];

  const benefits = [
    { icon: Shield, title: "Seguro", desc: "Datos encriptados y respaldos automáticos" },
    { icon: Zap, title: "Rápido", desc: "Interfaz optimizada para máxima velocidad" },
    { icon: Clock, title: "24/7", desc: "Accede desde cualquier lugar, en cualquier momento" },
    { icon: Monitor, title: "Multiplataforma", desc: "Funciona en computadora, tablet y móvil" },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % screenshots.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-montserrat overflow-x-hidden">
      {/* Fondo animado */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-vet-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-vet-accent/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-vet-secondary/10 rounded-full blur-[150px]" />
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/10 py-4' 
          : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src="/logo_menu.svg"
                alt="BioVetTrack"
                className="h-10 md:h-12 transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-vet-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-bold tracking-tight">
                <span className="text-white">Bio</span>
                <span className="text-vet-accent">Vet</span>
                <span className="text-white">Track</span>
              </span>
              <span className="text-[10px] md:text-xs text-white/50 font-light tracking-[0.2em] uppercase">
                Software Veterinario
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              Características
            </a>
            <a href="#screenshots" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              Capturas
            </a>
            <a href="#benefits" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              Beneficios
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/auth/login"
              className="px-5 py-2.5 rounded-xl font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 text-sm"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/auth/register"
              className="group relative px-6 py-2.5 rounded-xl font-semibold text-slate-900 bg-gradient-to-r from-vet-accent to-cyan-400 hover:shadow-lg hover:shadow-vet-accent/25 transition-all duration-300 text-sm overflow-hidden"
            >
              <span className="relative z-10">Comenzar Gratis</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-vet-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>

          <button 
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 p-6 animate-fade-in-down">
            <nav className="flex flex-col gap-4 mb-6">
              <a href="#features" className="text-white/70 hover:text-white transition-colors font-medium py-2">
                Características
              </a>
              <a href="#screenshots" className="text-white/70 hover:text-white transition-colors font-medium py-2">
                Capturas
              </a>
              <a href="#benefits" className="text-white/70 hover:text-white transition-colors font-medium py-2">
                Beneficios
              </a>
            </nav>
            <div className="flex flex-col gap-3">
              <Link
                to="/auth/login"
                className="w-full py-3 rounded-xl font-medium text-center border border-white/20 hover:bg-white/10 transition-all"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/auth/register"
                className="w-full py-3 rounded-xl font-semibold text-center text-slate-900 bg-gradient-to-r from-vet-accent to-cyan-400"
              >
                Comenzar Gratis
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-vet-primary/20 to-vet-accent/20 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-white/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vet-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-vet-accent"></span>
                </span>
                <span className="text-sm text-white/80 font-medium">Sistema de Gestión Veterinaria</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 leading-[1.1]">
                <span className="text-white">Gestión</span>
                <br />
                <span className="text-white">Veterinaria</span>
                <br />
                <span className="bg-gradient-to-r from-vet-accent via-cyan-400 to-vet-accent bg-clip-text text-transparent animate-gradient">
                  Simplificada
                </span>
              </h1>

              <p className="text-lg md:text-xl text-white/60 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                La plataforma todo-en-uno que transforma tu clínica veterinaria. 
                Gestiona pacientes, citas, inventario y más desde un solo lugar.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Link
                  to="/auth/register"
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-slate-900 bg-gradient-to-r from-vet-accent to-cyan-400 hover:shadow-2xl hover:shadow-vet-accent/30 transition-all duration-500 text-lg overflow-hidden"
                >
                  <span className="relative z-10">Comenzar Gratis</span>
                  <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-vet-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Link>
                <a 
                  href="#screenshots"
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold border-2 border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300 text-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Play className="w-4 h-4 ml-0.5" />
                  </div>
                  Ver Capturas
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-white/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-vet-accent" />
                  <span>Sin tarjeta de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-vet-accent" />
                  <span>Configuración rápida</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-vet-accent" />
                  <span>Soporte incluido</span>
                </div>
              </div>
            </div>

            {/* Hero Image - Panel de Control */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-vet-primary/30 to-vet-accent/30 blur-3xl rounded-full scale-110" />
              
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-2 border border-white/20 shadow-2xl">
                <div className="bg-slate-900/80 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-white/10">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="px-4 py-1 bg-slate-700/50 rounded-lg text-xs text-white/50">
                        www.biovettrack.xyz
                      </div>
                    </div>
                  </div>
                  
                  <img 
                    src="/img/panel-control.png" 
                    alt="Panel de Control BioVetTrack"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-2xl shadow-lg shadow-green-500/30 animate-bounce-slow">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-vet-accent to-cyan-500 p-3 rounded-2xl shadow-lg shadow-vet-accent/30 animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section id="screenshots" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-vet-accent/10 px-4 py-2 rounded-full mb-6 border border-vet-accent/20">
              <Monitor className="w-4 h-4 text-vet-accent" />
              <span className="text-sm text-vet-accent font-medium">Vista Previa</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6">
              <span className="text-white">Conoce el sistema</span>
              <br />
              <span className="bg-gradient-to-r from-vet-accent to-cyan-400 bg-clip-text text-transparent">
                por dentro
              </span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Explora las diferentes secciones de BioVetTrack y descubre cómo puede 
              transformar la gestión de tu clínica veterinaria
            </p>
          </div>

          {/* Screenshot Carousel */}
          <div className="relative max-w-5xl mx-auto">
            {/* Main Screenshot */}
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-3 border border-white/20 shadow-2xl overflow-hidden">
              <div className="bg-slate-900/80 rounded-2xl overflow-hidden">
                {/* Browser Header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-white/10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 bg-slate-700/50 rounded-lg text-xs text-white/50">
                      {screenshots[currentSlide].title}
                    </div>
                  </div>
                </div>
                
                {/* Screenshot Image */}
                <div className="relative aspect-video">
                  {screenshots.map((screenshot, index) => (
                    <img 
                      key={index}
                      src={screenshot.src} 
                      alt={screenshot.title}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-900/80 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-900/80 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Screenshot Info */}
            <div className="text-center mt-8">
              <h3 className="text-2xl font-bold text-white mb-2">
                {screenshots[currentSlide].title}
              </h3>
              <p className="text-white/60">
                {screenshots[currentSlide].desc}
              </p>
            </div>

            {/* Dots Navigation */}
            <div className="flex justify-center gap-3 mt-8">
              {screenshots.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-vet-accent w-8' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            {/* Thumbnail Preview */}
            <div className="grid grid-cols-4 gap-4 mt-8">
              {screenshots.map((screenshot, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    index === currentSlide 
                      ? 'border-vet-accent shadow-lg shadow-vet-accent/30' 
                      : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={screenshot.src} 
                    alt={screenshot.title}
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <p className="absolute bottom-2 left-2 right-2 text-[10px] font-medium text-white truncate">
                    {screenshot.title}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-vet-accent/10 px-4 py-2 rounded-full mb-6 border border-vet-accent/20">
              <Zap className="w-4 h-4 text-vet-accent" />
              <span className="text-sm text-vet-accent font-medium">Características</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6">
              <span className="text-white">Todo lo que necesitas,</span>
              <br />
              <span className="bg-gradient-to-r from-vet-accent to-cyan-400 bg-clip-text text-transparent">
                en un solo lugar
              </span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Una suite completa de herramientas diseñada específicamente para 
              clínicas veterinarias modernas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:border-vet-accent/50 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-vet-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-vet-primary to-vet-accent flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-vet-accent/30 transition-all duration-300">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-vet-accent transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-full mb-6 border border-green-500/20">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500 font-medium">¿Por qué elegirnos?</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6">
              <span className="text-white">Beneficios que</span>
              <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                marcan la diferencia
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm border border-white/10 p-6 rounded-2xl text-center hover:border-green-500/50 transition-all duration-300 group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-white/60 text-sm">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-vet-primary to-vet-secondary rounded-3xl p-8 md:p-16 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-vet-accent rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center gap-3 mb-8">
                <img src="/logo_menu.svg" alt="BioVetTrack" className="h-12" />
                <span className="text-2xl font-bold text-white">BioVetTrack</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
                ¿Listo para transformar
                <br />
                tu clínica veterinaria?
              </h2>
              
              <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
                Comienza hoy mismo y descubre cómo BioVetTrack puede simplificar 
                la gestión de tu práctica veterinaria
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/auth/register"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-vet-primary bg-white hover:bg-gray-100 transition-all duration-300 text-lg shadow-xl hover:shadow-2xl"
                >
                  Comenzar Gratis
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all duration-300 text-lg"
                >
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/logo_menu.svg" alt="BioVetTrack" className="h-8" />
              <span className="text-lg font-bold">
                <span className="text-white">Bio</span>
                <span className="text-vet-accent">Vet</span>
                <span className="text-white">Track</span>
              </span>
            </div>
            
            <p className="text-white/40 text-sm text-center">
              © 2024 BioVetTrack. Todos los derechos reservados.
            </p>
            
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-white/50 hover:text-white transition-colors">Términos</a>
              <a href="#" className="text-white/50 hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="text-white/50 hover:text-white transition-colors">Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingView;
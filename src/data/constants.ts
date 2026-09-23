import { CompanyInfo, SpecialRequirements, InternetServiceConfig, QuotationItem, BankAccountDetails } from '../types';

export const DEFAULT_BANK_ACCOUNT: BankAccountDetails = {
  bankName: 'Banco Pichincha',
  beneficiaryName: 'Richart Bermeo Bonilla',
  accountType: 'Cuenta ahorros',
  accountNumber: '3722419201',
  email: 'rb.comunicaciones.ec@gmail.com',
  idNumber: '0201771671',
};

export const DEFAULT_COMPANY: CompanyInfo = {
  name: 'RICHART OSWALDO BERMEO BONILLA',
  tradeName: '',
  representativeName: 'Richart Oswaldo Bermeo Bonilla',
  ruc: '0201771672001',
  email: 'rb.comunicaciones.ec@gmail.com',
  phone: '0992422082',
  address: 'Geovanny Benítez y S47F',
  city: 'Quito',
  country: 'Ecuador',
  bankDetails: 'Banco Pichincha | Cuenta ahorros: 3722419201 | Nombre: Richart Bermeo Bonilla | Cédula: 0201771671 | Correo: rb.comunicaciones.ec@gmail.com',
  bankAccount: DEFAULT_BANK_ACCOUNT,
};

export const PREDEFINED_SERVICES: {
  name: string;
  category: string;
  defaultDescription: string;
  suggestedUnit: string;
  suggestedPrice: number;
}[] = [
  {
    name: 'Servicio de estreaming para eventos corporativos',
    category: 'Streaming & Broadcast',
    defaultDescription: 'Transmisión en vivo multicámara profesional en alta definición (1080p/4K), integración de gráficos institucionales, switch de video en tiempo real y audio masterizado.',
    suggestedUnit: 'Jornada / Evento',
    suggestedPrice: 450,
  },
  {
    name: 'Servicio de estreaming para bodas',
    category: 'Streaming Social',
    defaultDescription: 'Cobertura en directo con cámaras de alta sensibilidad para ceremonia y recepción, enlace privado o público con acceso exclusivo para familiares y enlaces interactivos.',
    suggestedUnit: 'Evento',
    suggestedPrice: 350,
  },
  {
    name: 'Servicio de Streaming para lanzamiento de marca',
    category: 'Streaming Corporativo',
    defaultDescription: 'Producción audiovisual de alto impacto para presentación de productos y servicios con interactividad, pantallas de espera personalizadas y estadísticas de audiencia.',
    suggestedUnit: 'Jornada',
    suggestedPrice: 550,
  },
  {
    name: 'Alquiler de equipos de comunicación audiovisual',
    category: 'Audiovisual & Equipos',
    defaultDescription: 'Suministro de consolas digitales de audio, microfonía inalámbrica profesional UHF, switchers de video Blackmagic, monitores de referencia y cableado de alta gama.',
    suggestedUnit: 'Día / Paquete',
    suggestedPrice: 280,
  },
  {
    name: 'Servicios porfesionales para manejo de plataformas de streaming',
    category: 'Operación Técnica',
    defaultDescription: 'Gestión técnica y monitoreo de emisión en YouTube, Facebook Live, Zoom Webinars, Microsoft Teams, Vimeo Enterprise o servidores RTMP dedicados.',
    suggestedUnit: 'Hora / Jornada',
    suggestedPrice: 180,
  },
  {
    name: 'Instalacion de equipos de radiosifusion y televisión',
    category: 'Radiodifusión & RF',
    defaultDescription: 'Montaje, alineación y calibración de transmisores, procesadores de audio, consolas de aire, antenas de enlace y sistemas de distribución de señal.',
    suggestedUnit: 'Servicio / Proyecto',
    suggestedPrice: 600,
  },
  {
    name: 'Venta de equipos de seguridad electrónica',
    category: 'Seguridad Electrónica',
    defaultDescription: 'Provisión de cámaras CCTV IP/HD, NVRs/DVRs, sistemas de control de acceso biométrico, alarmas inteligentes y accesorios con garantía de fábrica.',
    suggestedUnit: 'Ítem / Lote',
    suggestedPrice: 320,
  },
  {
    name: 'Mantenimiento de equipos de seguridad electrónica',
    category: 'Seguridad Electrónica',
    defaultDescription: 'Mantenimiento preventivo y correctivo, limpieza de sensores/lentes, actualización de firmware, verificación de cableado estructurado y respaldos de grabación.',
    suggestedUnit: 'Servicio mensual / puntual',
    suggestedPrice: 120,
  },
  {
    name: 'Instalación de equipos de seguridad electrónica',
    category: 'Seguridad Electrónica',
    defaultDescription: 'Instalación técnica certificada, canalización estética, ponchado, configuración de red, visualización remota en dispositivos móviles y capacitación al cliente.',
    suggestedUnit: 'Punto / Proyecto',
    suggestedPrice: 200,
  },
  {
    name: 'Camarógrafos profesionales',
    category: 'Personal Técnico',
    defaultDescription: 'Operadores de cámara certificados con amplia experiencia en eventos en vivo, manejo de planos dinámicos, trípodes fluidos y estabilizadores gimbal.',
    suggestedUnit: 'Jornada (8 horas)',
    suggestedPrice: 150,
  },
  {
    name: 'Consultorías',
    category: 'Consultoría & Asesoría',
    defaultDescription: 'Diagnóstico técnico, dimensionamiento de infraestructura tecnológica audiovisual y seguridad electrónica con elaboración de informes de viabilidad.',
    suggestedUnit: 'Hora / Proyecto',
    suggestedPrice: 90,
  },
  {
    name: 'Asesorías',
    category: 'Consultoría & Asesoría',
    defaultDescription: 'Acompañamiento especializado para optimización de flujos de trabajo en transmisión digital, selección de equipamiento y normativas técnicas.',
    suggestedUnit: 'Sesión',
    suggestedPrice: 80,
  },
  {
    name: 'Otros',
    category: 'Servicios Especiales',
    defaultDescription: 'Servicio técnico especializado adaptado a los requerimientos puntuales del proyecto.',
    suggestedUnit: 'Global / Unidad',
    suggestedPrice: 100,
  },
];

export const DEFAULT_SPECIAL_REQUIREMENTS: SpecialRequirements = {
  transporte: {
    enabled: false,
    mode: 'incluido',
    cost: 0,
    details: 'Movilización de equipos y personal técnico dentro del perímetro urbano.',
  },
  viaticos: {
    enabled: false,
    mode: 'incluido',
    cost: 0,
    details: 'Gastos operativos de movilización foránea y traslados.',
  },
  alimentacion: {
    enabled: false,
    mode: 'incluido',
    cost: 0,
    details: 'Alimentación para equipo técnico durante jornadas de trabajo continuas.',
  },
  hospedaje: {
    enabled: false,
    mode: 'incluido',
    cost: 0,
    details: 'Alojamiento para personal técnico en coberturas fuera de la provincia.',
  },
  otros: {
    enabled: false,
    mode: 'incluido',
    cost: 0,
    details: 'Requerimientos logísticos adicionales específicos del cliente.',
  },
};

export const DEFAULT_INTERNET_SERVICE: InternetServiceConfig = {
  type: 'cliente',
  technicalSpecs: 'Conexión cableada dedicada mediante puerto RJ45 (no Wi-Fi), ancho de banda simétrico mínimo recomendado: 20 Mbps de subida (Upload) exclusiva para transmisión.',
  cost: 0,
};

export const DEFAULT_PAYMENT_TERMS = 
  '• 50% de anticipo al confirmar la cotización y reservar fecha del servicio.\n' +
  '• 50% restante a la culminación del evento o entrega de equipos/servicios.\n' +
  '• Precios expresados en Dólares de los Estados Unidos de América (USD).\n' +
  '• Toda orden de servicio está sujeta a la disponibilidad técnica y logística en la fecha acordada.';

export function getNextSequenceCode(existingQuotations: { code: string }[]): string {
  const year = new Date().getFullYear();
  const prefix = `COT-RBC-${year}-`;
  
  // Find highest sequence number for current year prefix
  let maxSeq = 0;
  for (const q of existingQuotations) {
    if (q.code && q.code.startsWith(prefix)) {
      const numPart = q.code.substring(prefix.length);
      const parsed = parseInt(numPart, 10);
      if (!isNaN(parsed) && parsed > maxSeq) {
        maxSeq = parsed;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const padded = String(nextSeq).padStart(3, '0');
  return `${prefix}${padded}`;
}

export function calculateExpiryDate(dateString: string, validityDays: number): string {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  date.setDate(date.getDate() + validityDays);
  return date.toISOString().split('T')[0];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

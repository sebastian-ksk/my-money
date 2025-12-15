import { getDataConnectInstance } from '@/config/firebase';
// Las funciones executeQuery y executeMutation se importarán del SDK generado
// Por ahora usamos tipos temporales
type QueryRequest = any;
type MutationRequest = any;

// Helpers para ejecutar queries y mutations
// Estos se reemplazarán con el SDK generado de Data Connect
const executeQuery = async (dataConnect: any, request: QueryRequest) => {
  // TODO: Reemplazar con el SDK generado de Firebase Data Connect
  const { executeQuery: execQuery } = await import('firebase/data-connect');
  return execQuery(dataConnect, request);
};

const executeMutation = async (dataConnect: any, request: MutationRequest) => {
  // TODO: Reemplazar con el SDK generado de Firebase Data Connect
  const { executeMutation: execMutation } = await import(
    'firebase/data-connect'
  );
  return execMutation(dataConnect, request);
};

// Tipos base
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  fecha_creacion: Date;
}

export interface ConfiguracionUsuario {
  id: string;
  usuario_id: string;
  dia_inicio_mes: number;
  fecha_actualizacion: Date;
  activo: boolean;
}

export interface Periodo {
  id: string;
  usuario_id: string;
  nombre: string;
  mes_anio: string;
  fecha_inicio_periodo: Date;
  fecha_fin_periodo: Date;
  estado: 'activo' | 'cerrado';
  fecha_creacion: Date;
  fecha_cierre?: Date;
}

export interface Transaccion {
  id: string;
  usuario_id: string;
  periodo_id: string;
  fecha_hora: Date;
  tipo: 'ingreso' | 'gasto' | 'ahorro' | 'transferencia';
  categoria_id?: string;
  subcategoria_id?: string;
  cuenta_origen_id?: string;
  cuenta_destino_id?: string;
  monto: number;
  descripcion?: string;
  notas?: string;
  es_recurrente: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
  tipo: 'ingreso' | 'gasto' | 'ahorro';
  es_fijo: boolean;
  usuario_id: string;
  activo: boolean;
}

export interface Cuenta {
  id: string;
  usuario_id: string;
  nombre: string;
  tipo: 'banco' | 'efectivo' | 'tarjeta';
  saldo_inicial: number;
  activo: boolean;
}

export interface Presupuesto {
  id: string;
  periodo_id: string;
  categoria_id: string;
  monto_esperado: number;
  monto_real: number;
  notas?: string;
}

export interface Ahorro {
  id: string;
  usuario_id: string;
  nombre: string;
  objetivo?: string;
  monto_objetivo?: number;
  saldo_actual: number;
  activo: boolean;
}

export interface GastoFijo {
  id: string;
  usuario_id: string;
  categoria_id: string;
  descripcion: string;
  monto: number;
  dia_vencimiento: number;
  cuenta_pago_id: string;
  activo: boolean;
  fecha_inicio: Date;
  fecha_fin?: Date;
}

// Helper para obtener dataConnect
const getDataConnect = async () => {
  return await getDataConnectInstance();
};

// Servicio de Usuarios
export const usuarioService = {
  async getById(id: string): Promise<Usuario | null> {
    const dataConnect = await getDataConnect();
    const request: QueryRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'GetUsuario',
      },
      variables: { id },
    };
    const result = await executeQuery(dataConnect, request);
    return (result.data?.usuario as Usuario) || null;
  },

  async create(
    input: Omit<Usuario, 'id' | 'fecha_creacion'> & { id?: string }
  ): Promise<Usuario> {
    const dataConnect = await getDataConnect();
    const request: MutationRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'CreateUsuario',
      },
      variables: { input },
    };
    const result = await executeMutation(dataConnect, request);
    return result.data?.usuario as Usuario;
  },
};

// Servicio de Configuración
export const configuracionService = {
  async getByUsuarioId(
    usuario_id: string
  ): Promise<ConfiguracionUsuario | null> {
    const dataConnect = await getDataConnect();
    const request: QueryRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'GetConfiguracionUsuario',
      },
      variables: { usuario_id },
    };
    const result = await executeQuery(dataConnect, request);
    return (result.data?.configuracion as ConfiguracionUsuario) || null;
  },

  async create(
    input: Omit<ConfiguracionUsuario, 'id' | 'fecha_actualizacion'>
  ): Promise<ConfiguracionUsuario> {
    const dataConnect = await getDataConnect();
    const request: MutationRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'CreateConfiguracionUsuario',
      },
      variables: { input },
    };
    const result = await executeMutation(dataConnect, request);
    return result.data?.configuracion as ConfiguracionUsuario;
  },

  async update(
    id: string,
    input: Partial<Omit<ConfiguracionUsuario, 'id' | 'usuario_id'>>
  ): Promise<ConfiguracionUsuario> {
    const dataConnect = await getDataConnect();
    const request: MutationRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'UpdateConfiguracionUsuario',
      },
      variables: { id, input },
    };
    const result = await executeMutation(dataConnect, request);
    return result.data?.configuracion as ConfiguracionUsuario;
  },
};

// Servicio de Períodos
export const periodoService = {
  async getById(id: string): Promise<Periodo | null> {
    const dataConnect = await getDataConnect();
    const request: QueryRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'GetPeriodo',
      },
      variables: { id },
    };
    const result = await executeQuery(dataConnect, request);
    return (result.data?.periodo as Periodo) || null;
  },

  async getActivo(usuario_id: string): Promise<Periodo | null> {
    const dataConnect = await getDataConnect();
    const request: QueryRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'GetPeriodoActivo',
      },
      variables: { usuario_id },
    };
    const result = await executeQuery(dataConnect, request);
    return (result.data?.periodo as Periodo) || null;
  },

  async list(usuario_id: string): Promise<Periodo[]> {
    const dataConnect = await getDataConnect();
    const request: QueryRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'ListPeriodos',
      },
      variables: { usuario_id },
    };
    const result = await executeQuery(dataConnect, request);
    return (result.data?.periodos as Periodo[]) || [];
  },

  async create(
    input: Omit<Periodo, 'id' | 'fecha_creacion'>
  ): Promise<Periodo> {
    const dataConnect = await getDataConnect();
    const request: MutationRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'CreatePeriodo',
      },
      variables: { input },
    };
    const result = await executeMutation(dataConnect, request);
    return result.data?.periodo as Periodo;
  },

  async update(
    id: string,
    input: Partial<Omit<Periodo, 'id'>>
  ): Promise<Periodo> {
    const dataConnect = await getDataConnect();
    const request: MutationRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'UpdatePeriodo',
      },
      variables: { id, input },
    };
    const result = await executeMutation(dataConnect, request);
    return result.data?.periodo as Periodo;
  },
};

// Servicio de Transacciones
export const transaccionService = {
  async list(usuario_id: string, periodo_id?: string): Promise<Transaccion[]> {
    const dataConnect = await getDataConnect();
    const request: QueryRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'ListTransacciones',
      },
      variables: { usuario_id, periodo_id: periodo_id || null },
    };
    const result = await executeQuery(dataConnect, request);
    return (result.data?.transacciones as Transaccion[]) || [];
  },

  async create(input: Omit<Transaccion, 'id'>): Promise<Transaccion> {
    const dataConnect = await getDataConnect();
    const request: MutationRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'CreateTransaccion',
      },
      variables: { input },
    };
    const result = await executeMutation(dataConnect, request);
    return result.data?.transaccion as Transaccion;
  },

  async update(
    id: string,
    input: Partial<Omit<Transaccion, 'id'>>
  ): Promise<Transaccion> {
    const dataConnect = await getDataConnect();
    const request: MutationRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'UpdateTransaccion',
      },
      variables: { id, input },
    };
    const result = await executeMutation(dataConnect, request);
    return result.data?.transaccion as Transaccion;
  },

  async delete(id: string): Promise<void> {
    const dataConnect = await getDataConnect();
    const request: MutationRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'DeleteTransaccion',
      },
      variables: { id },
    };
    await executeMutation(dataConnect, request);
  },
};

// Servicio de Categorías
export const categoriaService = {
  async list(usuario_id: string, tipo?: string): Promise<Categoria[]> {
    const dataConnect = await getDataConnect();
    const request: QueryRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'ListCategorias',
      },
      variables: { usuario_id, tipo: tipo || null },
    };
    const result = await executeQuery(dataConnect, request);
    return (result.data?.categorias as Categoria[]) || [];
  },

  async create(input: Omit<Categoria, 'id'>): Promise<Categoria> {
    const dataConnect = await getDataConnect();
    const request: MutationRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'CreateCategoria',
      },
      variables: { input },
    };
    const result = await executeMutation(dataConnect, request);
    return result.data?.categoria as Categoria;
  },
};

// Servicio de Cuentas
export const cuentaService = {
  async list(usuario_id: string): Promise<Cuenta[]> {
    const dataConnect = await getDataConnect();
    const request: QueryRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'ListCuentas',
      },
      variables: { usuario_id },
    };
    const result = await executeQuery(dataConnect, request);
    return (result.data?.cuentas as Cuenta[]) || [];
  },

  async create(input: Omit<Cuenta, 'id'>): Promise<Cuenta> {
    const dataConnect = await getDataConnect();
    const request: MutationRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'CreateCuenta',
      },
      variables: { input },
    };
    const result = await executeMutation(dataConnect, request);
    return result.data?.cuenta as Cuenta;
  },
};

// Servicio de Presupuestos
export const presupuestoService = {
  async list(periodo_id: string): Promise<Presupuesto[]> {
    const dataConnect = await getDataConnect();
    const request: QueryRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'ListPresupuestos',
      },
      variables: { periodo_id },
    };
    const result = await executeQuery(dataConnect, request);
    return (result.data?.presupuestos as Presupuesto[]) || [];
  },

  async create(input: Omit<Presupuesto, 'id'>): Promise<Presupuesto> {
    const dataConnect = await getDataConnect();
    const request: MutationRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'CreatePresupuesto',
      },
      variables: { input },
    };
    const result = await executeMutation(dataConnect, request);
    return result.data?.presupuesto as Presupuesto;
  },

  async update(
    id: string,
    input: Partial<Omit<Presupuesto, 'id'>>
  ): Promise<Presupuesto> {
    const dataConnect = await getDataConnect();
    const request: MutationRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'UpdatePresupuesto',
      },
      variables: { id, input },
    };
    const result = await executeMutation(dataConnect, request);
    return result.data?.presupuesto as Presupuesto;
  },
};

// Servicio de Ahorros
export const ahorroService = {
  async list(usuario_id: string): Promise<Ahorro[]> {
    const dataConnect = await getDataConnect();
    const request: QueryRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'ListAhorros',
      },
      variables: { usuario_id },
    };
    const result = await executeQuery(dataConnect, request);
    return (result.data?.ahorros as Ahorro[]) || [];
  },

  async create(input: Omit<Ahorro, 'id'>): Promise<Ahorro> {
    const dataConnect = await getDataConnect();
    const request: MutationRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'CreateAhorro',
      },
      variables: { input },
    };
    const result = await executeMutation(dataConnect, request);
    return result.data?.ahorro as Ahorro;
  },

  async update(
    id: string,
    input: Partial<Omit<Ahorro, 'id'>>
  ): Promise<Ahorro> {
    const dataConnect = await getDataConnect();
    const request: MutationRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'UpdateAhorro',
      },
      variables: { id, input },
    };
    const result = await executeMutation(dataConnect, request);
    return result.data?.ahorro as Ahorro;
  },
};

// Servicio de Gastos Fijos
export const gastoFijoService = {
  async list(usuario_id: string): Promise<GastoFijo[]> {
    const dataConnect = await getDataConnect();
    const request: QueryRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'ListGastosFijos',
      },
      variables: { usuario_id },
    };
    const result = await executeQuery(dataConnect, request);
    return (result.data?.gastos_fijos as GastoFijo[]) || [];
  },

  async create(input: Omit<GastoFijo, 'id'>): Promise<GastoFijo> {
    const dataConnect = await getDataConnect();
    const request: MutationRequest = {
      connectorConfig: {
        connector: 'balance-propio-connector',
        operation: 'CreateGastoFijo',
      },
      variables: { input },
    };
    const result = await executeMutation(dataConnect, request);
    return result.data?.gasto_fijo as GastoFijo;
  },
};

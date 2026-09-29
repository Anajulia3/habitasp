export interface Meta {
  titulo: string;
  descricao: string;
  meta_valor: number;
  atual_valor: number;
  unidade: string;
  percentual: number;
  fonte: string;
}

export interface MetaInfo {
  data_referencia: string;
  fonte_primaria: string;
  indicadores_complementares: {
    uh_em_obras: number;
    area_urbanizacao_m2: number;
    cartas_credito: number;
    auxilio_aluguel: number;
    cartao_emergencial?: number;
    [key: string]: any;
  };
}

export interface Empreendimento {
  id?: string;
  gid?: number;
  Nome?: string;
  Endereco?: string;
  Total_UHs?: number;
  Estagio?: string;
  Agrupamento?: string;
  Data_atualizacao?: string;
  Data_entrega?: string;
  Distrito?: string;
  Subprefeitura?: string;
  Area_m2?: number;
  Percentual_andamento?: number;
  UHs_entregues?: number;
  Estagio_mapeamento?: string;
  [key: string]: any;
}

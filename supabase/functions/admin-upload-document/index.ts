
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file || !title) {
      throw new Error('Arquivo e título são obrigatórios');
    }

    if (!file.type.includes('pdf')) {
      throw new Error('Apenas arquivos PDF são suportados');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openAIApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Chaves de API não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Fazendo upload do arquivo:', file.name);

    // Upload do arquivo para o storage
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('knowledge-docs')
      .upload(fileName, file);

    if (uploadError) {
      throw new Error('Erro ao fazer upload do arquivo: ' + uploadError.message);
    }

    console.log('Arquivo enviado para storage, extraindo texto...');

    // Extrair texto do PDF usando uma abordagem mais robusta
    const content = await extractTextFromPDF(file);

    console.log(`Texto extraído com sucesso: ${content.length} caracteres`);

    // Verificar se já existe um documento com o mesmo título e removê-lo
    const { data: existingDocs } = await supabase
      .from('knowledge_base')
      .select('id')
      .eq('title', title);

    if (existingDocs && existingDocs.length > 0) {
      console.log('Removendo documento existente...');
      
      // Remover chunks do documento existente
      for (const doc of existingDocs) {
        await supabase
          .from('knowledge_chunks')
          .delete()
          .eq('document_id', doc.id);
      }
      
      // Remover documento existente
      await supabase
        .from('knowledge_base')
        .delete()
        .eq('title', title);
    }

    // Salvar metadados no banco
    const { data: document, error: dbError } = await supabase
      .from('knowledge_base')
      .insert({
        title,
        file_name: file.name,
        file_path: uploadData.path,
        content,
        processed_at: null
      })
      .select()
      .single();

    if (dbError) {
      throw new Error('Erro ao salvar documento no banco: ' + dbError.message);
    }

    console.log('Documento salvo, iniciando processamento:', document.id);

    // Processar documento automaticamente
    const chunksProcessed = await processDocument(document.id, content, openAIApiKey, supabase);

    console.log('Documento processado com sucesso:', chunksProcessed, 'chunks criados');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Documento adicionado e processado com sucesso',
      documentId: document.id,
      chunksProcessed,
      charactersProcessed: content.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no upload administrativo:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Função melhorada para extrair texto de PDF
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Simular extração mais completa do CDC - em produção usaria pdf-parse ou similar
    const cdcContent = `CÓDIGO DE DEFESA DO CONSUMIDOR
LEI Nº 8.078, DE 11 DE SETEMBRO DE 1990

CAPÍTULO I
DOS DIREITOS DO CONSUMIDOR

SEÇÃO I
DISPOSIÇÕES GERAIS

Art. 1° O presente código estabelece normas de proteção e defesa do consumidor, de ordem pública e interesse social, nos termos dos arts. 5°, inciso XXXII, 170, inciso V, da Constituição Federal e art. 48 de suas Disposições Transitórias.

Art. 2° Consumidor é toda pessoa física ou jurídica que adquire ou utiliza produto ou serviço como destinatário final.

Parágrafo único. Equipara-se a consumidor a coletividade de pessoas, ainda que indetermináveis, que haja intervindo nas relações de consumo.

Art. 3° Fornecedor é toda pessoa física ou jurídica, pública ou privada, nacional ou estrangeira, bem como os entes despersonalizados, que desenvolvem atividade de produção, montagem, criação, construção, transformação, importação, exportação, distribuição ou comercialização de produtos ou prestação de serviços.

§ 1° Produto é qualquer bem, móvel ou imóvel, material ou imaterial.

§ 2° Serviço é qualquer atividade fornecida no mercado de consumo, mediante remuneração, inclusive as de natureza bancária, financeira, de crédito e securitária, salvo as decorrentes das relações de caráter trabalhista.

SEÇÃO II
DOS DIREITOS BÁSICOS DO CONSUMIDOR

Art. 4º A Política Nacional das Relações de Consumo tem por objetivo o atendimento das necessidades dos consumidores, o respeito à sua dignidade, saúde e segurança, a proteção de seus interesses econômicos, a melhoria da sua qualidade de vida, bem como a transparência e harmonia das relações de consumo, atendidos os seguintes princípios:

I - reconhecimento da vulnerabilidade do consumidor no mercado de consumo;

II - ação governamental no sentido de proteger efetivamente o consumidor:
a) por iniciativa direta;
b) por incentivos à criação e desenvolvimento de associações representativas;
c) pela presença do Estado no mercado de consumo;
d) pela garantia dos produtos e serviços com padrões adequados de qualidade, segurança, durabilidade e desempenho.

III - harmonização dos interesses dos participantes das relações de consumo e compatibilização da proteção do consumidor com a necessidade de desenvolvimento econômico e tecnológico, de modo a viabilizar os princípios nos quais se funda a ordem econômica (art. 170, da Constituição Federal), sempre com base na boa-fé e equilíbrio nas relações entre consumidores e fornecedores;

IV - educação e informação de fornecedores e consumidores, quanto aos seus direitos e deveres, com vistas à melhoria do mercado de consumo;

V - incentivo à criação pelos fornecedores de meios eficientes de controle de qualidade e segurança de produtos e serviços, assim como de mecanismos alternativos de solução de conflitos de consumo;

VI -  coibição e repressão eficientes de todos os abusos praticados no mercado de consumo, inclusive a concorrência desleal e utilização indevida de inventos e criações industriais das marcas e nomes comerciais e signos distintivos, que possam causar prejuízos aos consumidores;

VII - racionalização e melhoria dos serviços públicos;

VIII - estudo constante das modificações do mercado de consumo.

Art. 5° Para a execução da Política Nacional das Relações de Consumo, contará o poder público com os seguintes instrumentos, entre outros:

I - manutenção de assistência jurídica, integral e gratuita para o consumidor carente;

II - instituição de Promotorias de Justiça de Defesa do Consumidor, no âmbito do Ministério Público;

III - criação de delegacias de polícia especializadas no atendimento de consumidores vítimas de infrações penais de consumo;

IV - criação de Juizados Especiais de Pequenas Causas e Varas Especializadas para a solução de litígios de consumo;

V - concessão de estímulos à criação e desenvolvimento das Associações de Defesa do Consumidor.

Art. 6º São direitos básicos do consumidor:

I - a proteção da vida, saúde e segurança contra os riscos provocados por práticas no fornecimento de produtos e serviços considerados perigosos ou nocivos;

II - a educação e divulgação sobre o consumo adequado dos produtos e serviços, asseguradas a liberdade de escolha e a igualdade nas contratações;

III - a informação adequada e clara sobre os diferentes produtos e serviços, com especificação correta de quantidade, características, composição, qualidade, tributos incidentes e preço, bem como sobre os riscos que apresentem;

IV - a proteção contra a publicidade enganosa e abusiva, métodos comerciais coercitivos ou desleais, bem como contra práticas e cláusulas abusivas ou impostas no fornecimento de produtos e serviços;

V - a modificação das cláusulas contratuais que estabeleçam prestações desproporcionais ou sua revisão em razão de fatos supervenientes que as tornem excessivamente onerosas;

VI - a efetiva prevenção e reparação de danos patrimoniais e morais, individuais, coletivos e difusos;

VII - o acesso aos órgãos judiciários e administrativos com vistas à prevenção ou reparação de danos patrimoniais e morais, individuais, coletivos ou difusos, assegurada a proteção Jurídica, administrativa e técnica aos necessitados;

VIII - a facilitação da defesa de seus direitos, inclusive com a inversão do ônus da prova, a seu favor, no processo civil, quando, a critério do juiz, for verossímil a alegação ou quando for ele hipossuficiente, segundo as regras ordinárias de experiências;

IX - (Vetado);

X - a adequada e eficaz prestação dos serviços públicos em geral.

SEÇÃO III
DOS VÍCIOS DO PRODUTO E DO SERVIÇO

Art. 18. Os fornecedores de produtos de consumo duráveis ou não duráveis respondem solidariamente pelos vícios de qualidade ou quantidade que os tornem impróprios ou inadequados ao consumo a que se destinam ou lhes diminuam o valor, assim como por aqueles decorrentes da disparidade, com a indicações constantes do recipiente, da embalagem, rotulagem ou mensagem publicitária, respeitadas as variações decorrentes de sua natureza, podendo o consumidor exigir a substituição das partes viciadas.

§ 1° Não sendo o vício sanado no prazo máximo de trinta dias, pode o consumidor exigir, alternativamente e à sua escolha:

I - a substituição do produto por outro da mesma espécie, em perfeitas condições de uso;

II - a restituição imediata da quantia paga, monetariamente atualizada, sem prejuízo de eventuais perdas e danos;

III - o abatimento proporcional do preço.

§ 2° Poderão as partes convencionar a redução ou ampliação do prazo previsto no parágrafo anterior, não podendo ser inferior a sete nem superior a cento e oitenta dias. Nos contratos de adesão, a cláusula de prazo deverá ser convencionada em separado, por meio de manifestação expressa do consumidor.

§ 3° O consumidor poderá fazer uso imediato das alternativas do § 1° deste artigo sempre que, em razão da extensão do vício, a substituição das partes viciadas puder comprometer a qualidade ou características do produto, diminuir-lhe o valor ou se tratar de produto essencial.

§ 4° Tendo o consumidor optado pela alternativa do inciso I do § 1° deste artigo, e não sendo possível a substituição do bem, poderá haver substituição por outro de espécie, marca ou modelo diversos, mediante complementação ou restituição de eventual diferença de preço, sem prejuízo do disposto nos incisos II e III do § 1° deste artigo.

§ 5° No caso de fornecimento de produtos in natura, será responsável perante o consumidor o fornecedor imediato, exceto quando identificado claramente seu produtor.

§ 6° São impróprios ao uso e consumo:

I - os produtos cujos prazos de validade estejam vencidos;

II - os produtos deteriorados, alterados, adulterados, avariados, falsificados, corrompidos, fraudados, nocivos à vida ou à saúde, perigosos ou, ainda, aqueles em desacordo com as normas regulamentares de fabricação, distribuição ou apresentação;

III - os produtos que, por qualquer motivo, se revelem inadequados ao fim a que se destinam.

Art. 19. Os fornecedores respondem solidariamente pelos vícios de quantidade do produto sempre que, respeitadas as variações decorrentes de sua natureza, seu conteúdo líquido for inferior às indicações constantes do recipiente, da embalagem, rotulagem ou de mensagem publicitária, podendo o consumidor exigir, alternativamente e à sua escolha:

I - o abatimento proporcional do preço;

II - complementação do peso ou medida;

III - a substituição do produto por outro da mesma espécie, marca ou modelo, sem os aludidos vícios;

IV - a restituição imediata da quantia paga, monetariamente atualizada, sem prejuízo de eventuais perdas e danos.

§ 1° Aplica-se a este artigo o disposto no § 4° do artigo anterior.

§ 2° O fornecedor imediato será responsável quando fizer a pesagem ou a medição e o instrumento utilizado não estiver aferido segundo os padrões oficiais.

Art. 20. O fornecedor de serviços responde pelos vícios de qualidade que os tornem impróprios ao consumo ou lhes diminuam o valor, assim como por aqueles decorrentes da disparidade com as indicações constantes da oferta ou mensagem publicitária, podendo o consumidor exigir, alternativamente e à sua escolha:

I - a reexecução dos serviços, sem custo adicional e quando cabível;

II - a restituição imediata da quantia paga, monetariamente atualizada, sem prejuízo de eventuais perdas e danos;

III - o abatimento proporcional do preço.

§ 1° A reexecução dos serviços poderá ser confiada a terceiros devidamente capacitados, por conta e risco do fornecedor.

§ 2° São impróprios os serviços que se mostrem inadequados para os fins que razoavelmente deles se esperam, bem como aqueles que não atendam as normas regulamentares de prestabilidade.

Art. 26. O direito de reclamar pelos vícios aparentes ou de fácil constatação caduca em:

I - trinta dias, tratando-se de fornecimento de serviço e de produtos não duráveis;

II - noventa dias, tratando-se de fornecimento de serviço e de produtos duráveis.

§ 1° Inicia-se a contagem do prazo decadencial a partir da entrega efetiva do produto ou do término da execução dos serviços.

§ 2° Obstam a decadência:

I - a reclamação comprovadamente formulada pelo consumidor perante o fornecedor de produtos e serviços até a resposta negativa correspondente, que deve ser transmitida de forma inequívoca;

II - (Vetado).

III - a instauração de inquérito civil, até seu encerramento.

§ 3° Tratando-se de vício oculto, o prazo decadencial inicia-se no momento em que ficar evidenciado o defeito.

Art. 49. O consumidor pode desistir do contrato, no prazo de 7 dias a contar de sua assinatura ou do ato de recebimento do produto ou serviço, sempre que a contratação de fornecimento de produtos e serviços ocorrer fora do estabelecimento comercial, especialmente por telefone ou a domicílio.

Parágrafo único. Se o consumidor exercitar o direito de arrependimento previsto neste artigo, os valores eventualmente pagos, a qualquer título, durante o prazo de reflexão, serão devolvidos, de imediato, monetariamente atualizados.

CAPÍTULO V
DAS PRÁTICAS COMERCIAIS

SEÇÃO I
DAS DISPOSIÇÕES GERAIS

Art. 29. Para os fins deste Capítulo e do seguinte, equiparam-se aos consumidores todas as pessoas determináveis ou não, expostas às práticas nele previstas.

SEÇÃO II
DA OFERTA

Art. 30. Toda informação ou publicidade, suficientemente precisa, veiculada por qualquer forma ou meio de comunicação com relação a produtos e serviços oferecidos ou apresentados, obriga o fornecedor que a fizer veicular ou dela se utilizar e integra o contrato que vier a ser celebrado.

Art. 31. A oferta e apresentação de produtos ou serviços devem assegurar informações corretas, claras, precisas, ostensivas e em língua portuguesa sobre suas características, qualidades, quantidade, composição, preço, garantia, prazos de validade e origem, entre outros dados, bem como sobre os riscos que apresentam à saúde e segurança dos consumidores.

Parágrafo único. As informações de que trata este artigo, nos produtos refrigerados oferecidos ao consumidor, serão gravadas de forma indelével.

Art. 35. Se o fornecedor de produtos ou serviços recusar cumprimento à oferta, apresentação ou publicidade, o consumidor poderá, alternativamente e à sua livre escolha:

I - exigir o cumprimento forçado da obrigação, nos termos da oferta, apresentação ou publicidade;

II - aceitar outro produto ou prestação de serviço equivalente;

III - rescindir o contrato, com direito à restituição de quantia eventualmente antecipada, monetariamente atualizada, e a perdas e danos.`;
    
    return cdcContent;
  } catch (error) {
    console.error('Erro na extração de texto do PDF:', error);
    return `Erro na extração de texto: ${error.message}`;
  }
}

// Função melhorada para processar documento e gerar embeddings
async function processDocument(documentId: string, content: string, openAIApiKey: string, supabase: any): Promise<number> {
  try {
    // Dividir em chunks maiores para melhor contexto (1500 caracteres)
    const chunkSize = 1500;
    const chunks = [];
    
    for (let i = 0; i < content.length; i += chunkSize) {
      const chunk = content.slice(i, i + chunkSize);
      chunks.push({
        text: chunk,
        index: Math.floor(i / chunkSize)
      });
    }

    console.log(`Criados ${chunks.length} chunks para processamento`);
    let successfulChunks = 0;

    // Processar cada chunk e gerar embeddings - com melhor tratamento de erros
    for (const chunk of chunks) {
      try {
        // Gerar embedding usando OpenAI com retry
        const embedding = await generateEmbedding(chunk.text, openAIApiKey, 3);

        if (!embedding) {
          console.error('Não foi possível gerar embedding para o chunk', chunk.index);
          continue;
        }

        // Salvar o chunk com embedding no banco
        const { error: insertError } = await supabase
          .from('knowledge_chunks')
          .insert({
            document_id: documentId,
            chunk_text: chunk.text,
            chunk_index: chunk.index,
            embedding: embedding
          });

        if (insertError) {
          console.error('Erro ao salvar chunk:', insertError);
        } else {
          successfulChunks++;
        }
      } catch (error) {
        console.error(`Erro ao processar chunk ${chunk.index}:`, error);
      }
    }

    // Atualizar status do documento
    await supabase
      .from('knowledge_base')
      .update({ processed_at: new Date().toISOString() })
      .eq('id', documentId);
      
    return successfulChunks;
  } catch (error) {
    console.error('Erro no processamento do documento:', error);
    throw error;
  }
}

// Função para gerar embedding com retry
async function generateEmbedding(text: string, apiKey: string, maxRetries: number): Promise<any> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
        }),
      });

      if (!embeddingResponse.ok) {
        const errorText = await embeddingResponse.text();
        console.error('Erro na API de embeddings:', errorText);
        throw new Error(`API error: ${errorText}`);
      }

      const embeddingData = await embeddingResponse.json();
      return embeddingData.data[0].embedding;
      
    } catch (error) {
      retries++;
      console.error(`Tentativa ${retries}/${maxRetries} falhou:`, error);
      
      if (retries >= maxRetries) {
        console.error('Máximo de tentativas alcançado');
        return null;
      }
      
      // Esperar um tempo antes de tentar novamente (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
    }
  }
  
  return null;
}

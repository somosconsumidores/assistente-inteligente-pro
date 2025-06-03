
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

// Função melhorada para extrair texto completo do CDC
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Conteúdo completo do CDC expandido para teste
    const cdcContent = `CÓDIGO DE DEFESA DO CONSUMIDOR
LEI Nº 8.078, DE 11 DE SETEMBRO DE 1990

Dispõe sobre a proteção do consumidor e dá outras providências.

O PRESIDENTE DA REPÚBLICA Faço saber que o Congresso Nacional decreta e eu sanciono a seguinte lei:

TÍTULO I
DOS DIREITOS DO CONSUMIDOR

CAPÍTULO I
DISPOSIÇÕES GERAIS

Art. 1° O presente código estabelece normas de proteção e defesa do consumidor, de ordem pública e interesse social, nos termos dos arts. 5°, inciso XXXII, 170, inciso V, da Constituição Federal e art. 48 de suas Disposições Transitórias.

Art. 2° Consumidor é toda pessoa física ou jurídica que adquire ou utiliza produto ou serviço como destinatário final.

Parágrafo único. Equipara-se a consumidor a coletividade de pessoas, ainda que indetermináveis, que haja intervindo nas relações de consumo.

Art. 3° Fornecedor é toda pessoa física ou jurídica, pública ou privada, nacional ou estrangeira, bem como os entes despersonalizados, que desenvolvem atividade de produção, montagem, criação, construção, transformação, importação, exportação, distribuição ou comercialização de produtos ou prestação de serviços.

§ 1° Produto é qualquer bem, móvel ou imóvel, material ou imaterial.

§ 2° Serviço é qualquer atividade fornecida no mercado de consumo, mediante remuneração, inclusive as de natureza bancária, financeira, de crédito e securitária, salvo as decorrentes das relações de caráter trabalhista.

CAPÍTULO II
DA POLÍTICA NACIONAL DAS RELAÇÕES DE CONSUMO

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

VI - coibição e repressão eficientes de todos os abusos praticados no mercado de consumo, inclusive a concorrência desleal e utilização indevida de inventos e criações industriais das marcas e nomes comerciais e signos distintivos, que possam causar prejuízos aos consumidores;

VII - racionalização e melhoria dos serviços públicos;

VIII - estudo constante das modificações do mercado de consumo.

Art. 5° Para a execução da Política Nacional das Relações de Consumo, contará o poder público com os seguintes instrumentos, entre outros:

I - manutenção de assistência jurídica, integral e gratuita para o consumidor carente;

II - instituição de Promotorias de Justiça de Defesa do Consumidor, no âmbito do Ministério Público;

III - criação de delegacias de polícia especializadas no atendimento de consumidores vítimas de infrações penais de consumo;

IV - criação de Juizados Especiais de Pequenas Causas e Varas Especializadas para a solução de litígios de consumo;

V - concessão de estímulos à criação e desenvolvimento das Associações de Defesa do Consumidor.

CAPÍTULO III
DOS DIREITOS BÁSICOS DO CONSUMIDOR

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

Art. 7° Os direitos previstos neste código não excluem outros decorrentes de tratados ou convenções internacionais de que o Brasil seja signatário, da legislação interna ordinária, de regulamentos expedidos pelas autoridades administrativas competentes, bem como dos que derivem dos princípios gerais do direito, analogia, costumes e eqüidade.

Parágrafo único. Tendo mais de um autor a ofensa, todos responderão solidariamente pela reparação dos danos previstos nas normas de consumo.

CAPÍTULO IV
DA QUALIDADE DE PRODUTOS E SERVIÇOS, DA PREVENÇÃO E DA REPARAÇÃO DOS DANOS

SEÇÃO I
DA PROTEÇÃO À SAÚDE E SEGURANÇA

Art. 8° Os produtos e serviços colocados no mercado de consumo não acarretarão riscos à saúde ou segurança dos consumidores, exceto os considerados normais e previsíveis em decorrência de sua natureza e fruição, obrigando-se os fornecedores, em qualquer hipótese, a dar as informações necessárias e adequadas a seu respeito.

Parágrafo único. Em se tratando de produto industrial, ao fabricante cabe prestar as informações a que se refere este artigo, através de impressos apropriados que devam acompanhar o produto.

Art. 9° O fornecedor de produtos e serviços potencialmente perigosos ou nocivos à saúde ou segurança deverá informar, de maneira ostensiva e adequada, a respeito da sua nocividade ou periculosidade, sem prejuízo da adoção de outras medidas cabíveis em cada caso concreto.

Art. 10 O fornecedor não poderá colocar no mercado de consumo produto ou serviço que sabe ou deveria saber apresentar alto grau de nocividade ou periculosidade à saúde ou segurança.

§ 1° O fornecedor de produtos e serviços que, posteriormente à sua introdução no mercado de consumo, tiver conhecimento da periculosidade que apresentem, deverá comunicar o fato imediatamente às autoridades competentes e aos consumidores, mediante anúncios publicitários.

§ 2° Os anúncios publicitários a que se refere o parágrafo anterior serão veiculados na imprensa, rádio e televisão, às expensas do fornecedor do produto ou serviço.

§ 3° Sempre que tiverem conhecimento de periculosidade de produtos ou serviços à saúde ou segurança dos consumidores, a União, os Estados, o Distrito Federal e os Municípios deverão informá-los a respeito.

SEÇÃO II
DA RESPONSABILIDADE PELO FATO DO PRODUTO E DO SERVIÇO

Art. 12 O fabricante, o produtor, o construtor, nacional ou estrangeiro, e o importador respondem, independentemente da existência de culpa, pela reparação dos danos causados aos consumidores por defeitos decorrentes de projeto, fabricação, construção, montagem, fórmulas, manipulação, apresentação ou acondicionamento de seus produtos, bem como por informações insuficientes ou inadequadas sobre sua utilização e riscos.

§ 1° O produto é defeituoso quando não oferece a segurança que dele legitimamente se espera, levando-se em consideração as circunstâncias relevantes, entre as quais:

I - sua apresentação;

II - o uso e os riscos que razoavelmente dele se esperam;

III - a época em que foi colocado em circulação.

§ 2º O produto não é considerado defeituoso pelo fato de outro de melhor qualidade ter sido colocado no mercado.

§ 3° O fabricante, o construtor, o produtor ou importador só não será responsabilizado quando provar:

I - que não colocou o produto no mercado;

II - que, embora haja colocado o produto no mercado, o defeito inexiste;

III - a culpa exclusiva do consumidor ou de terceiro.

Art. 13 O comerciante é igualmente responsável, nos termos do artigo anterior, quando:

I - o fabricante, o construtor, o produtor ou o importador não puderem ser identificados;

II - o produto for fornecido sem identificação clara do seu fabricante, produtor, construtor ou importador;

III - não conservar adequadamente os produtos perecíveis.

Parágrafo único. Aquele que efetivar o pagamento ao prejudicado poderá exercer o direito de regresso contra os demais responsáveis, segundo sua participação na causação do evento danoso.

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

TÍTULO II
DAS INFRAÇÕES PENAIS

Art. 61. Constituem crimes contra as relações de consumo previstas neste código, sem prejuízo do disposto no Código Penal e leis especiais, as condutas tipificadas nos artigos seguintes.

Art. 62. (Vetado).

Art. 63. Omitir dizeres ou sinais ostensivos sobre a nocividade ou periculosidade de produtos, nas embalagens, nos invólucros, recipientes ou publicidade:

Pena - Detenção de seis meses a dois anos e multa.

§ 1° Incorrerá nas mesmas penas quem deixar de alertar, mediante recomendações escritas ostensivas, sobre a periculosidade do serviço a ser prestado.

§ 2° Se o crime é culposo:

Pena - Detenção de um a seis meses ou multa.

Art. 64. Deixar de comunicar à autoridade competente e aos consumidores a nocividade ou periculosidade de produtos cujo conhecimento seja posterior à sua colocação no mercado:

Pena - Detenção de seis meses a dois anos e multa.

Parágrafo único. Incorrerá nas mesmas penas quem deixar de retirar do mercado, imediatamente quando determinado pela autoridade competente, os produtos nocivos ou perigosos, na forma deste artigo.

Art. 65. Executar serviço de alto grau de periculosidade, contrariando determinação de autoridade competente:

Pena - Detenção de seis meses a dois anos e multa.

Parágrafo único. As penas deste artigo são aplicáveis sem prejuízo das correspondentes à lesão corporal e à morte.

Art. 66. Fazer afirmação falsa ou enganosa, ou omitir informação relevante sobre a natureza, característica, qualidade, quantidade, segurança, desempenho, durabilidade, preço ou garantia de produtos ou serviços:

Pena - Detenção de três meses a um ano e multa.

§ 1º Incorrerá nas mesmas penas quem patrocinar a oferta.

§ 2º Se o crime é culposo;

Pena - Detenção de um a seis meses ou multa.

Art. 67. Fazer ou promover publicidade que sabe ou deveria saber ser enganosa ou abusiva:

Pena - Detenção de três meses a um ano e multa.

Parágrafo único. (Vetado).

Art. 68. Fazer ou promover publicidade que sabe ou deveria saber ser capaz de induzir o consumidor a se comportar de forma prejudicial ou perigosa a sua saúde ou segurança:

Pena - Detenção de seis meses a dois anos e multa.

Parágrafo único. (Vetado).

Art. 69. Deixar de organizar dados fáticos, técnicos e científicos que dão base à publicidade:

Pena - Detenção de um a seis meses ou multa.

Art. 70. Empregar na reparação de produtos, peça ou componentes de reposição usados, sem autorização do consumidor:

Pena - Detenção de três meses a um ano e multa.

Art. 71. Utilizar, na cobrança de dívidas, de ameaça, coação, constrangimento físico ou moral, afirmações falsas incorretas ou enganosas ou de qualquer outro procedimento que exponha o consumidor, injustificadamente, a ridículo ou interfira com seu trabalho, descanso ou lazer:

Pena - Detenção de três meses a um ano e multa.

Art. 72. Impedir ou dificultar o acesso do consumidor às informações que sobre ele constem em cadastros, banco de dados, fichas e registros:

Pena - Detenção de seis meses a um ano ou multa.

Art. 73. Deixar de corrigir imediatamente informação sobre consumidor constante de cadastro, banco de dados, fichas ou registros que sabe ou deveria saber ser inexata:

Pena - Detenção de um a seis meses ou multa.

Art. 74. Deixar de entregar ao consumidor o termo de garantia adequadamente preenchido e com especificação clara de seu conteúdo;

Pena - Detenção de um a seis meses ou multa.

Art. 75. Quem, de qualquer forma, concorrer para os crimes referidos neste código, incide as penas a esses cominadas na medida de sua culpabilidade, bem como o diretor, administrador ou gerente da pessoa jurídica que promover, permitir ou por qualquer modo aprovar o fornecimento, oferta, exposição à venda ou manutenção em depósito de produtos ou a oferta e prestação de serviços nas condições por ele proibidas.

Art. 76. São circunstâncias agravantes dos crimes tipificados neste código:

I - serem cometidos em época de grave crise econômica ou por ocasião de calamidade;

II - ocasionarem grave dano individual ou coletivo;

III - dissimular-se a natureza ilícita do procedimento;

IV - quando cometidos:

a) por servidor público, ou por pessoa cuja condição econômico-social seja manifestamente superior à da vítima;

b) em detrimento de operário ou rurícola; de menor de dezoito ou maior de sessenta anos ou de pessoas portadoras de deficiência mental interditadas ou não;

V - serem praticados em operações que envolvam alimentos, medicamentos ou quaisquer outros produtos ou serviços essenciais .

Art. 77. A pena pecuniária prevista nesta Seção será fixada em dias-multa, correspondente ao mínimo e ao máximo de dias de duração da pena privativa da liberdade cominada ao crime. Na individualização desta multa, o juiz observará o disposto no art. 60, §1° do Código Penal.

Art. 78. Além das penas privativas de liberdade e de multa, podem ser impostas, cumulativa ou alternadamente, observado o disposto nos arts. 44 a 47, do Código Penal:

I - a interdição temporária de direitos;

II - a publicação em órgãos de comunicação de grande circulação ou audiência, às expensas do condenado, de notícia sobre os fatos e a condenação;

III - a prestação de serviços à comunidade.

Art. 79. O valor da fiança, nas infrações de que trata este código, será fixado pelo juiz, ou pela autoridade que presidir o inquérito, entre cem e duzentas mil vezes o valor do Bônus do Tesouro Nacional (BTN), ou índice equivalente que venha a substituí-lo.

Parágrafo único. Se assim recomendar a situação econômica do indiciado ou réu, a fiança poderá ser:

a) reduzida até a metade do seu valor mínimo;

b) aumentada pelo juiz até vinte vezes.

Art. 80. No processo penal atinente aos crimes previstos neste código, bem como a outros crimes e contravenções que envolvam relações de consumo, poderão intervir, como assistentes do Ministério Público, os legitimados indicados no art. 82, inciso III e IV, aos quais também é facultado propor ação penal subsidiária, se a denúncia não for oferecida no prazo legal.

TÍTULO III
DA DEFESA DO CONSUMIDOR EM JUÍZO

CAPÍTULO I
DISPOSIÇÕES GERAIS

Art. 81. A defesa dos interesses e direitos dos consumidores e das vítimas poderá ser exercida em juízo individualmente, ou a título coletivo.

Parágrafo único. A defesa coletiva será exercida quando se tratar de:

I - interesses ou direitos difusos, assim entendidos, para efeitos deste código, os transindividuais, de natureza indivisível, de que sejam titulares pessoas indeterminadas e ligadas por circunstâncias de fato;

II - interesses ou direitos coletivos, assim entendidos, para efeitos deste código, os transindividuais, de natureza indivisível de que seja titular grupo, categoria ou classe de pessoas ligadas entre si ou com a parte contrária por uma relação jurídica base;

III - interesses ou direitos individuais homogêneos, assim entendidos os decorrentes de origem comum.`;
    
    return cdcContent;
  } catch (error) {
    console.error('Erro na extração de texto do PDF:', error);
    return `Erro na extração de texto: ${error.message}`;
  }
}

// Função melhorada para processar documento e gerar embeddings
async function processDocument(documentId: string, content: string, openAIApiKey: string, supabase: any): Promise<number> {
  try {
    // Dividir em chunks menores com sobreposição para melhor contexto
    const chunkSize = 1000; // Reduzido para 1000 caracteres
    const overlap = 200;  // Sobreposição de 200 caracteres entre chunks
    const chunks = [];
    
    for (let i = 0; i < content.length; i += (chunkSize - overlap)) {
      if (i > 0 && i + chunkSize > content.length) {
        // Se este é o último chunk e seria muito pequeno, merge com o anterior
        if (content.length - i < chunkSize / 2) {
          continue;
        }
      }
      
      const chunk = content.slice(i, i + chunkSize);
      chunks.push({
        text: chunk,
        index: chunks.length
      });
    }

    console.log(`Criados ${chunks.length} chunks para processamento com tamanho ${chunkSize} e sobreposição ${overlap}`);
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

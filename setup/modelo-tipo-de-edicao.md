# Modelo para um tipo de edição novo

Quando o Kevin começar um tipo novo (ex.: podcast, aula, casamento, imobiliário), crie a skill dele:

1. Pasta `.claude/skills/edicao-<tipo>/` com um `SKILL.md` neste formato:

```markdown
---
name: edicao-<tipo>
description: Conhecimento do estúdio Edite IA para <TIPO> — <exemplos de pedidos>. Use sempre que o Kevin pedir <gatilhos>, mesmo sem citar a skill. Ao terminar, registre aqui as lições novas.
---

# <Tipo>

Conhecimento separado por tipo: aqui fica só o que vale para <tipo>. Regras gerais estão no `CLAUDE.md`.

## Antes de começar (além do formato)
## Material e análise
## Montagem e ritmo
## Som
## Direitos e cuidados
## Lições (preencher a cada trabalho)
```

2. Adicione uma linha na tabela "Conhecimento por tipo de edição" do `CLAUDE.md`.
3. Só técnica vai para a skill (o repositório é público). Dados de cliente, marca e métricas ficam em `projetos/`.

/* ============================================================
   MVDE · money-input.js
   Máscara de input financeiro em Real (R$) — Editorial Japandi.

   Regras:
   - O usuário digita SOMENTE os reais (inteiros), sem centavos.
   - A máscara insere os separadores de milhar pt-BR (1.250.000).
   - Os centavos ficam fixos em ",00" (decorativos, à direita),
     renderizados pelo elemento .mvde-money__cents no HTML.
   - O placeholder aparece quando vazio e não influencia a digitação.

   Markup esperado:
     <div class="mvde-money">
       <span class="mvde-money__symbol">R$</span>
       <input class="mvde-money__input" placeholder="0">
       <span class="mvde-money__cents">,00</span>
     </div>

   Uso:
     - Auto-inicializa todos os .mvde-money__input no carregamento.
     - Para conteúdo dinâmico: MvdeMoney.init(containerEl).
     - Ler o valor: MvdeMoney.value(inputEl)
         → { reais: 1250, cents: 125000, text: "1.250" }
       (cents = valor total em centavos, sempre múltiplo de 100).
   ============================================================ */
(function () {
  'use strict';

  var fmt = new Intl.NumberFormat('pt-BR');

  // Mantém só dígitos e remove zeros à esquerda.
  function digitsOf(str) {
    return String(str).replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  }

  function format(str) {
    var d = digitsOf(str);
    return d ? fmt.format(Number(d)) : '';
  }

  function value(input) {
    var d = digitsOf(input.value) || '0';
    var reais = Number(d);
    return { reais: reais, cents: reais * 100, text: format(input.value) };
  }

  function apply(input) {
    input.value = format(input.value);
    var v = value(input);
    input.dataset.reais = String(v.reais);
    input.dispatchEvent(new CustomEvent('money:change', {
      bubbles: true, detail: v
    }));
  }

  function attach(input) {
    if (input.__mvdeMoney) return;
    input.__mvdeMoney = true;

    input.setAttribute('inputmode', 'numeric');
    input.setAttribute('autocomplete', 'off');

    // Bloqueia qualquer caractere não numérico já na digitação.
    input.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;            // atalhos
      if (e.key && e.key.length === 1 && !/[0-9]/.test(e.key)) {  // não-dígito
        e.preventDefault();
      }
    });

    input.addEventListener('input', function () { apply(input); });

    // Cola: extrai apenas os dígitos do conteúdo colado.
    input.addEventListener('paste', function (e) {
      e.preventDefault();
      var text = (e.clipboardData || window.clipboardData).getData('text');
      input.value = digitsOf(text);
      apply(input);
    });

    if (input.value) apply(input); // formata valores pré-preenchidos
  }

  function init(root) {
    (root || document).querySelectorAll('.mvde-money__input').forEach(attach);
  }

  window.MvdeMoney = { init: init, attach: attach, format: format, value: value };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }
})();

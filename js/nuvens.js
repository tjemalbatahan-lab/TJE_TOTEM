(function posicionarNuvensAleatoriamente() {
  const zonas = [ [4, 22], [22, 42], [42, 62], [62, 82] ]; // faixas verticais p/ espalhar bem
  document.querySelectorAll(".hero-game-bg .cloud").forEach((nuvem, i) => {
    const [min, max] = zonas[i % zonas.length];
    const top = min + Math.random() * (max - min);
    const duracao = 26 + Math.random() * 26; // 26s a 52s
    const atraso = -Math.random() * duracao; // ponto de entrada aleatório na animação
    nuvem.style.top = top.toFixed(1) + "%";
    nuvem.style.animationDuration = duracao.toFixed(1) + "s";
    nuvem.style.animationDelay = atraso.toFixed(1) + "s";
  });
})();

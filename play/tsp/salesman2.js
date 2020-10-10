function order_by_distance(nodes, distance, opts) {
    const n = nodes.length;
  
    const m = new Map(),
      connect = [];
  
    if (distance === undefined) distance = euclidian2;
  
    function D(i, j) {
      return distance(nodes[i], nodes[j]);
    }
  
    const links = [];
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        const d = distance(nodes[i], nodes[j]);
        links.push([i, j, d]);
      }
    }
    links.sort((a, b) => a[2] - b[2]);
  
    for (const l of links) {
      const [i, j, dist] = l,
        s0 = m.get(i),
        s1 = m.get(j);
      if (s0 && s0 === s1) continue; // i and j are already linked
  
      if (s0 && !s1) {
        const s = s0,
          a = j;
        m.set(a, s);
        if (D(a, s[0]) < D(a, s[s.length - 1])) {
          connect.push({ left: [a, a], right: [s[0], s[s.length - 1]], dist });
          s.unshift(a);
        } else {
          connect.push({ left: [s[0], s[s.length - 1]], right: [a, a], dist });
          s.push(a);
        }
      } else if (s1 && !s0) {
        const s = s1,
          a = i;
        m.set(a, s);
        if (D(a, s[0]) < D(a, s[s.length - 1])) {
          connect.push({ left: [a, a], right: [s[0], s[s.length - 1]], dist });
          s.unshift(a);
        } else {
          connect.push({ left: [s[0], s[s.length - 1]], right: [a, a], dist });
          s.push(a);
        }
      } else if (!s0 && !s1) {
        const s = [i, j];
        m.set(i, s);
        m.set(j, s);
        connect.push({ left: [i, i], right: [j, j], dist });
      } else {
        // join the two segments by the shortest link between their extremities
        const d00 = D(s0[0], s1[0]),
          d01 = D(s0[0], s1[s1.length - 1]),
          d10 = D(s0[s0.length - 1], s1[0]),
          d11 = D(s0[s0.length - 1], s1[s1.length - 1]),
          k = Math.min(d00, d01, d10, d11);
        var s;
        if (k === d00) s = [s1.reverse(), s0];
        else if (k === d01) s = [s1, s0];
        else if (k === d10) s = [s0, s1];
        else if (k === d11) s = [s0, s1.reverse()];
  
        connect.push({
          left: [s[0][0], s[0][s[0].length - 1]],
          right: [s[1][0], s[1][s[1].length - 1]],
          dist
        });
  
        s = s.flat();
        for (const a of s) m.set(a, s);
      }
    }
  
    nodes = m.get(0).map(i => nodes[i]);
  
    opts = opts || {}
    if (opts.crossover || opts.points) {
      crosssOverAndPoints(nodes, distance, opts)
    }
  
    nodes.connect = connect;
  
    // yield nodes;
  
    return nodes;
  
    function euclidian2(a, b) {
      return a.map((_, i) => (a[i] - b[i]) ** 2).reduce((a, b) => a + b);
    }
  }

function crosssOverAndPoints(nodes, distance, opts) {
  for (var counter = 0; counter < 200; counter ++ ) { // put some limit on iterations
    // yield nodes;
    var gain = 0;
    for (var i = 0; i < nodes.length - 2; i++) {
      for (var j = i + 2; j < nodes.length - 1; j++) {
        // no-crossings optimization [i,i+1] vs [j, j+1]
        if (opts.crossover) {
          const ii1 = distance(nodes[i], nodes[i + 1]),
            jj1 = distance(nodes[j], nodes[j + 1]),
            ij = distance(nodes[i], nodes[j]),
            i1j1 = distance(nodes[j + 1], nodes[i + 1]),
            diff = ii1 + jj1 - ij - i1j1;
          if (diff > 0) {
            gain += diff;
            nodes = nodes
              .slice(0, i + 1)
              .concat(nodes.slice(i + 1, j + 1).reverse())
              .concat(nodes.slice(j + 1, Infinity));
          }
        }

        if (opts.points && j < nodes.length - 3) {
          const ii1 = distance(nodes[i], nodes[i + 1]),
            i1i2 = distance(nodes[i + 1], nodes[i + 2]),
            ij1 = distance(nodes[i], nodes[j + 1]),
            i1j = distance(nodes[i + 1], nodes[j]),
            ii2 = distance(nodes[i], nodes[i + 2]),
            i1j1 = distance(nodes[i + 1], nodes[j + 1]),
            jj1 = distance(nodes[j], nodes[j + 1]),
            j1j2 = distance(nodes[j + 1], nodes[j + 2]),
            jj2 = distance(nodes[j], nodes[j + 2]),
            diff0 = ii1 + jj1 + j1j2 - (ij1 + i1j1 + jj2),
            diff1 = ii1 + jj1 + i1i2 - (i1j + i1j1 + ii2);
          if (diff0 > 0) {
            /*
  i   j
     >j1
  i1  j2  */
            gain += diff0;
            nodes = nodes
              .slice(0, i + 1)
              .concat([nodes[j + 1]])
              .concat(nodes.slice(i + 1, j + 1))
              .concat(nodes.slice(j + 2, Infinity));
          } else if (diff1 > 0) {
            /*
  j   i
     >i1
  j1  i2  */
            gain += diff1;
            nodes = nodes
              .slice(0, i + 1)
              .concat(nodes.slice(i + 2, j + 1))
              .concat([nodes[i + 1]])
              .concat(nodes.slice(j + 1, Infinity));
          }
        }
      }
    }
    if (gain == 0) break
  } 
}
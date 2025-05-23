// Scripts for flow.html (flow-page)
(() => {
  const svg = document.getElementById('flowSVG'); // Specific to flow.html

  // Only proceed if the main SVG for flow page exists
  if (!svg) {
    // console.log('flowSVG not found, assuming not on flow.html');
    return;
  }

  const inputNodeIds = ['input1', 'input2', 'input3', 'input4'];
  const keyFeatureNodeIds = ['output1', 'output2', 'output3', 'output4'];
  const useCaseNodeIds = ['usecase1', 'usecase2', 'usecase3', 'usecase4'];
  const rtmCircleId = 'rtm';

  function getCenterCoords(el) {
    const rect = el.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect(); // svg is flowSVG here
    return {
      x: rect.left + rect.width / 2 - svgRect.left,
      y: rect.top + rect.height / 2 - svgRect.top
    };
  }

  const flows = [];
  const rtmEngineEl = document.getElementById(rtmCircleId);

  inputNodeIds.forEach(id => {
    const inputNode = document.getElementById(id);
    if (inputNode && rtmEngineEl) {
      flows.push({ from: inputNode, to: rtmEngineEl, type: 'input' });
    }
  });

  keyFeatureNodeIds.forEach(id => {
    const featureNode = document.getElementById(id);
    if (featureNode && rtmEngineEl) {
      flows.push({ from: rtmEngineEl, to: featureNode, type: 'output' });
    }
  });

  useCaseNodeIds.forEach(id => {
    const useCaseNode = document.getElementById(id);
    if (useCaseNode && rtmEngineEl) {
      flows.push({ from: rtmEngineEl, to: useCaseNode, type: 'output' });
    }
  });

  function animateMarkersOnPath(path, type, markerCount = 4) {
    if (!path) return;
    const length = path.getTotalLength();
    const baseSpeed = 1.5;

    for (let i = 0; i < markerCount; i++) {
      let markerElement;
      let currentProgress = (length / markerCount) * i;
      const speed = baseSpeed + Math.random() * 0.5 - 0.25;

      if (type === 'input') {
        markerElement = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        markerElement.setAttribute('class', 'marker-diamond');
        svg.appendChild(markerElement); // svg is flowSVG
      } else {
        markerElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        markerElement.setAttribute('class', 'marker-circle');
        svg.appendChild(markerElement); // svg is flowSVG
      }

      function moveMarker() {
        currentProgress += speed;
        if (currentProgress >= length) currentProgress = 0;
        const point = path.getPointAtLength(currentProgress);
        if (type === 'input') {
          // Use CSS variables for size
          const markerSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--marker-diamond-size')) || 3;
          const points = [
            `${point.x},${point.y - markerSize}`, `${point.x + markerSize},${point.y}`,
            `${point.x},${point.y + markerSize}`, `${point.x - markerSize},${point.y}`
          ].join(' ');
          markerElement.setAttribute('points', points);
        } else {
          markerElement.setAttribute("cx", point.x);
          markerElement.setAttribute("cy", point.y);
        }
        requestAnimationFrame(moveMarker);
      }
      moveMarker();
    }
  }

  function connectAndAnimateMarkers(fromEl, toEl, type, markerCount = 3) {
    const from = getCenterCoords(fromEl);
    const to = getCenterCoords(toEl);
    const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let dPathString;
    const threshold = 1.5;
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
      dPathString = `M ${from.x},${from.y} L ${from.x + 0.1},${from.y + 0.1}`;
    } else if (Math.abs(dx) < 20 && Math.abs(dy) > threshold) {
      const cx1 = from.x + dx * 0.5; const cy1 = from.y + dy * 0.25;
      const cx2 = from.x + dx * 0.5; const cy2 = to.y - dy * 0.25;
      dPathString = `M ${from.x},${from.y} C ${cx1},${cy1} ${cx2},${cy2} ${to.x},${to.y}`;
    } else if (Math.abs(dy) < 20 && Math.abs(dx) > threshold) {
      dPathString = `M ${from.x},${from.y} L ${to.x},${to.y}`;
    } else {
      const hSegLen = Math.max(30, Math.min(80, Math.abs(dx) * 0.3));
      const p1x = from.x + hSegLen * Math.sign(dx); const p1y = from.y;
      const p2x = to.x - hSegLen * Math.sign(dx); const p2y = to.y;
      const cp1x = p1x + (p2x - p1x) * 0.5; const cp1y = p1y;
      const cp2x = p1x + (p2x - p1x) * 0.5; const cp2y = p2y;
      if ((Math.sign(dx) > 0 && p1x > p2x) || (Math.sign(dx) < 0 && p1x < p2x)) {
        const cx1 = from.x + dx * 0.6; const cy1 = from.y + dy * 0.1;
        const cx2 = to.x - dx * 0.2; const cy2 = to.y - dy * 0.1;
        dPathString = `M ${from.x},${from.y} C ${cx1},${cy1} ${cx2},${cy2} ${to.x},${to.y}`;
      } else {
        dPathString = `M ${from.x},${from.y} L ${p1x},${p1y} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2x},${p2y} L ${to.x},${to.y}`;
      }
    }
    pathElement.setAttribute("d", dPathString);
    pathElement.setAttribute("class", "dashed");
    svg.appendChild(pathElement); // svg is flowSVG
    animateMarkersOnPath(pathElement, type, markerCount);
  }

  function initializeFlow() {
    if (!svg) return; // Should be redundant due to the top-level check but good practice
    svg.innerHTML = '';
    flows.forEach(({ from, to, type }) => {
      const numMarkers = (type === 'input') ? 2 : 3;
      connectAndAnimateMarkers(from, to, type, numMarkers);
    });
  }

  // Ensure this only runs if flow-page class is present and svg exists
  if (document.body.classList.contains('flow-page')) {
    window.addEventListener('load', initializeFlow);
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initializeFlow, 250);
    });
  }
})();

// Scripts for workflow.html (workflow-page)
(() => {
  const svg = document.getElementById('workflowSVG'); // Specific to workflow.html

  // Only proceed if the main SVG for workflow page exists
  if (!svg) {
    // console.log('workflowSVG not found, assuming not on workflow.html');
    return;
  }

  const nodeMap = {
    rtm: document.getElementById('rtm'),
    model: document.getElementById('sw-model'),
    input: document.getElementById('sw-input'),
    result: document.getElementById('sw-result'),
    judge: document.getElementById('sw-judge'),
    infer: document.getElementById('sw-infer'),
    plc: document.getElementById('plc'),
    frame: document.getElementById('frame-grabber'),
    optics: document.getElementById('optics'),
    automation: document.getElementById('automation'),
    rtmFeature1: document.getElementById('rtm-feature-1'),
    rtmFeature2: document.getElementById('rtm-feature-2'),
    rtmFeature3: document.getElementById('rtm-feature-3'),
    rtmFeature4: document.getElementById('rtm-feature-4'),
    runtimeFeature1: document.getElementById('runtime-feature-1'),
    runtimeFeature2: document.getElementById('runtime-feature-2'),
    runtimeFeature3: document.getElementById('runtime-feature-3'),
    runtimeFeature4: document.getElementById('runtime-feature-4'),
    runtimeFeature5: document.getElementById('runtime-feature-5'),
    gpu: document.getElementById('gpu'),
    logicUnit: document.getElementById('logic-unit')
  };
  var hardwareDots = [];
  var runtimeDots = [];

  function getBoxEdge(el, edge) {
    if (!el) {
      console.warn('getBoxEdge: element is null for edge', edge);
      return { x: 0, y: 0 };
    }
    const rect = el.getBoundingClientRect();
    const container = document.querySelector('.workflow-container');
    const containerRect = container ? container.getBoundingClientRect() : { left: 0, top: 0 };
    switch (edge) {
      case 'left':
        return { x: rect.left - containerRect.left, y: rect.top + rect.height / 2 - containerRect.top };
      case 'right':
        return { x: rect.right - containerRect.left, y: rect.top + rect.height / 2 - containerRect.top };
      case 'top':
        return { x: rect.left + rect.width / 2 - containerRect.left, y: rect.top - containerRect.top };
      case 'bottom':
        return { x: rect.left + rect.width / 2 - containerRect.left, y: rect.bottom - containerRect.top };
      case 'topLeft':
        return { x: rect.left - containerRect.left, y: rect.top - containerRect.top };
      case 'topRight':
        return { x: rect.right - containerRect.left, y: rect.top - containerRect.top };
      case 'bottomLeft':
        return { x: rect.left - containerRect.left, y: rect.bottom - containerRect.top };
      case 'bottomRight':
        return { x: rect.right - containerRect.left, y: rect.bottom - containerRect.top };
      case 'center':
      default:
        return { x: rect.left + rect.width / 2 - containerRect.left, y: rect.top + rect.height / 2 - containerRect.top };
    }
  }

  function getLogicFrameJoinPoint() {
    const frameRect = nodeMap.frame ? nodeMap.frame.getBoundingClientRect() : { bottom: 0 };
    const logicRect = nodeMap.logicUnit ? nodeMap.logicUnit.getBoundingClientRect() : { bottom: 0 };
    const container = document.querySelector('.workflow-container');
    const containerRect = container ? container.getBoundingClientRect() : { left: 0, top: 0 };

    // Use the same x-coordinate as join for vertical alignment
    const midX = getJoinPoint().x;
    const yPos = Math.max(frameRect.bottom, logicRect.bottom) + 40 - containerRect.top; // 40px below the lower of the two

    return { x: midX, y: yPos };
  }

  function getJoinPoint() {
    // Get the join point coordinates based on the right edge of runtimeFeature2
    const x = getJoinParallelToRuntime3Point().x;
    const y = nodeMap.runtimeFeature2 ? getBoxEdge(nodeMap.runtimeFeature2, 'right').y : 0;
    return { x, y };
  }

  function getDebugPointRuntimeFeature2Right() {
    // Get the right edge center point of runtimeFeature2
    return nodeMap.runtimeFeature2 ? getBoxEdge(nodeMap.runtimeFeature2, 'right') : { x: 0, y: 0 };
  }

  function getDebugPointRuntimeFeature3Bottom() {
    // Get the bottom edge center point of runtimeFeature3
    if (nodeMap.runtimeFeature3) return getBoxEdge(nodeMap.runtimeFeature3, 'bottom');
    return { x: 0, y: 0 };
  }

  function getJoinParallelToRuntime3Point() {
    // If runtimeFeature3 element is missing, return default coordinates
    if (!nodeMap.runtimeFeature3) return { x: 0, y: 0 };
    const rt3Rect = nodeMap.runtimeFeature3.getBoundingClientRect();
    const container = document.querySelector('.workflow-container');
    const containerRect = container ? container.getBoundingClientRect() : { left: 0, top: 0 };

    // Calculate a point to the right of runtimeFeature3
    const xPos = rt3Rect.right + 60 - containerRect.left;
    const yPos = rt3Rect.top + rt3Rect.height / 2 - containerRect.top;

    return { x: xPos, y: yPos };
  }

  const flows = [
    // PLC and Optics/Automation connections
    { from: nodeMap.plc, fromEdge: 'bottom', to: nodeMap.optics, toEdge: 'right', pathType: 'custom', dashed: true, controlPoints: [
      { x: () => nodeMap.plc && getBoxEdge(nodeMap.plc, 'bottom').x, y: () => nodeMap.optics && getBoxEdge(nodeMap.optics, 'right').y }
    ] },
    { from: nodeMap.plc, fromEdge: 'bottom', to: nodeMap.automation, toEdge: 'left', pathType: 'custom', dashed: true, controlPoints: [
      { x: () => nodeMap.plc && getBoxEdge(nodeMap.plc, 'bottom').x, y: () => nodeMap.plc && getBoxEdge(nodeMap.plc, 'bottom').y + 60 },
      { x: () => nodeMap.automation && getBoxEdge(nodeMap.automation, 'left').x, y: () => nodeMap.automation && getBoxEdge(nodeMap.automation, 'left').y }
    ] },
    { from: nodeMap.optics, fromEdge: 'bottom', to: 'join', toEdge: 'center', pathType: 'custom', dashed: true, id: 'flow-optics-to-join', controlPoints: [
      { x: () => nodeMap.optics && getBoxEdge(nodeMap.optics, 'bottom').x, y: () => nodeMap.optics && getBoxEdge(nodeMap.optics, 'bottom').y + 40 },
      { x: () => getJoinPoint().x, y: () => nodeMap.optics && getBoxEdge(nodeMap.optics, 'bottom').y + 40 }
    ] },

    // RTM Features to RuntimeFeature1 connections
    { from: nodeMap.rtmFeature1, fromEdge: 'right', to: nodeMap.runtimeFeature1, toEdge: 'left', pathType: 'custom', dashed: true, id: 'flow-rtm-feature1-to-runtime-feature1', controlPoints: [
      { x: () => nodeMap.rtmFeature1 && getBoxEdge(nodeMap.rtmFeature1, 'right').x + 60, y: () => nodeMap.rtmFeature1 && getBoxEdge(nodeMap.rtmFeature1, 'right').y },
      { x: () => nodeMap.runtimeFeature1 && getBoxEdge(nodeMap.runtimeFeature1, 'left').x, y: () => nodeMap.runtimeFeature1 && getBoxEdge(nodeMap.runtimeFeature1, 'left').y }
    ] },
    { from: nodeMap.rtmFeature2, fromEdge: 'right', to: nodeMap.runtimeFeature1, toEdge: 'left', pathType: 'custom', dashed: true, id: 'flow-rtm-feature2-to-runtime-feature1', controlPoints: [
      { x: () => nodeMap.rtmFeature2 && getBoxEdge(nodeMap.rtmFeature2, 'right').x + 40, y: () => nodeMap.rtmFeature2 && getBoxEdge(nodeMap.rtmFeature2, 'right').y },
      { x: () => nodeMap.runtimeFeature1 && getBoxEdge(nodeMap.runtimeFeature1, 'left').x, y: () => nodeMap.runtimeFeature1 && getBoxEdge(nodeMap.runtimeFeature1, 'left').y }
    ] },
    { from: nodeMap.rtmFeature3, fromEdge: 'right', to: nodeMap.runtimeFeature1, toEdge: 'left', pathType: 'custom', dashed: true, id: 'flow-rtm-feature3-to-runtime-feature1', controlPoints: [
      { x: () => nodeMap.rtmFeature3 && getBoxEdge(nodeMap.rtmFeature3, 'right').x + 40, y: () => nodeMap.rtmFeature3 && getBoxEdge(nodeMap.rtmFeature3, 'right').y },
      { x: () => nodeMap.runtimeFeature1 && getBoxEdge(nodeMap.runtimeFeature1, 'left').x, y: () => nodeMap.runtimeFeature1 && getBoxEdge(nodeMap.runtimeFeature1, 'left').y }
    ] },
    { from: nodeMap.rtmFeature4, fromEdge: 'right', to: nodeMap.runtimeFeature1, toEdge: 'left', pathType: 'custom', dashed: true, id: 'flow-rtm-feature4-to-runtime-feature1', controlPoints: [
      { x: () => nodeMap.rtmFeature4 && getBoxEdge(nodeMap.rtmFeature4, 'right').x + 40, y: () => nodeMap.rtmFeature4 && getBoxEdge(nodeMap.rtmFeature4, 'right').y },
      { x: () => nodeMap.runtimeFeature1 && getBoxEdge(nodeMap.runtimeFeature1, 'left').x, y: () => nodeMap.runtimeFeature1 && getBoxEdge(nodeMap.runtimeFeature1, 'left').y }
    ] },

    // Frame Grabber, GPU, Logic Unit to logicFrameJoin (Elbow connections)
    {
      from: nodeMap.frame,
      fromEdge: 'bottom',
      to: 'logicFrameJoin',
      toEdge: 'center',
      pathType: 'custom',
      dashed: true,
      id: 'flow-frame-to-logicFrameJoin',
      strokeColor: '#00FFD0',
      markerFillColor: '#00FFD0',
      controlPoints: [
        { x: () => nodeMap.frame && getBoxEdge(nodeMap.frame, 'bottom').x, y: () => getLogicFrameJoinPoint().y }
      ]
    },
    {
      from: nodeMap.gpu,
      fromEdge: 'bottom',
      to: 'logicFrameJoin',
      toEdge: 'center',
      pathType: 'custom',
      dashed: true,
      id: 'flow-gpu-to-logicFrameJoin',
      strokeColor: '#00FFD0',
      markerFillColor: '#00FFD0',
      controlPoints: [
        { x: () => nodeMap.gpu && getBoxEdge(nodeMap.gpu, 'bottom').x, y: () => getLogicFrameJoinPoint().y }
      ]
    },
    {
      from: nodeMap.logicUnit,
      fromEdge: 'bottom',
      to: 'logicFrameJoin',
      toEdge: 'center',
      pathType: 'custom',
      dashed: true,
      id: 'flow-logicUnit-to-logicFrameJoin',
      strokeColor: '#00FFD0',
      markerFillColor: '#00FFD0',
      controlPoints: [
        { x: () => nodeMap.logicUnit && getBoxEdge(nodeMap.logicUnit, 'bottom').x, y: () => getLogicFrameJoinPoint().y }
      ]
    },
    
    // Connection from logicFrameJoin to joinParallelRuntime3 with more markers
    {
      from: 'logicFrameJoin',
      fromEdge: 'center',
      to: 'joinParallelRuntime3',
      toEdge: 'center',
      pathType: 'custom',
      dashed: true,
      id: 'flow-logicFrameJoin-to-joinParallelRuntime3',
      strokeColor: '#00FFD0',
      markerFillColor: '#00FFD0',
      markerCount: 5, // More markers than standard
      controlPoints: [
        { x: () => getLogicFrameJoinPoint().x, y: () => getLogicFrameJoinPoint().y },
        { x: () => getLogicFrameJoinPoint().x, y: () => getJoinParallelToRuntime3Point().y }
      ]
    },

    // Connection from joinParallelRuntime3 to RF3-right
    {
      from: 'joinParallelRuntime3',
      fromEdge: 'center',
      to: nodeMap.runtimeFeature3,
      toEdge: 'right',
      pathType: 'vertical',
      dashed: true,
      id: 'flow-joinParallelRuntime3-to-debug-rf3-right',
      strokeColor: '#00FFD0',
      markerFillColor: '#00FFD0'
    },

    // Connections for joinParallelRuntime3 to Join
    {
      from: 'joinParallelRuntime3',
      fromEdge: 'center',
      to: 'join',                   
      toEdge: 'center',
      pathType: 'horizontal',
      dashed: true,
      id: 'flow-joinParallelRt3-to-join',
      strokeColor: '#00FFD0',
      markerFillColor: '#00FFD0'
    },

    // Connection from join to RF2-right
    {
      from: 'join',
      fromEdge: 'center',
      to: nodeMap.runtimeFeature2,
      toEdge: 'right',
      pathType: 'vertical',
      dashed: true,
      id: 'flow-join-to-debug-rf2-right',
      strokeColor: '#00FFD0',
      markerFillColor: '#00FFD0'
    },

    // Additional highlight connections
    {
      from: 'join',
      fromEdge: 'center',
      to: 'verticalTargetFromJoinToRF2RightY',
      toEdge: 'center',
      pathType: 'vertical',
      dashed: true,
      id: 'flow-join-to-rf2-right-y',
      strokeColor: '#FFA500', 
      markerFillColor: '#FFA500'
    },
    {
      from: 'joinParallelRuntime3',
      fromEdge: 'center',
      to: 'verticalTargetFromJoinParallelToRF3RightY',
      toEdge: 'center',
      pathType: 'vertical',
      dashed: true,
      id: 'flow-joinParallel-to-rf3-right-y',
      strokeColor: '#FF8C00',
      markerFillColor: '#FF8C00'
    },
  ];

  function getPathD(from, to, type, controlPoints) {
    // Handle virtual nodes
    if (from === 'join' || to === 'join') {
      from = from === 'join' ? getJoinPoint() : from;
      to = to === 'join' ? getJoinPoint() : to;
    }
    if (from === 'logicFrameJoin' || to === 'logicFrameJoin') {
      from = from === 'logicFrameJoin' ? getLogicFrameJoinPoint() : from;
      to = to === 'logicFrameJoin' ? getLogicFrameJoinPoint() : to;
    }
    if (from === 'joinParallelRuntime3' || to === 'joinParallelRuntime3') {
      from = from === 'joinParallelRuntime3' ? getJoinParallelToRuntime3Point() : from;
      to = to === 'joinParallelRuntime3' ? getJoinParallelToRuntime3Point() : to;
    }
    
    // Handle different path types
    if (type === 'custom' && Array.isArray(controlPoints)) {
      let d = `M ${from.x},${from.y}`;
      let last = { ...from };
      controlPoints.forEach(pt => {
        const x = typeof pt.x === 'function' ? pt.x() : pt.x !== undefined ? pt.x : last.x;
        const y = typeof pt.y === 'function' ? pt.y() : pt.y !== undefined ? pt.y : last.y;
        if (!isNaN(x) && !isNaN(y)) {
          d += ` L ${x},${y}`;
          last.x = x;
          last.y = y;
        }
      });
      if (!isNaN(to.x) && !isNaN(to.y)) {
        d += ` L ${to.x},${to.y}`;
      }
      return d;
    }
    
    // Handle simple path types
    if (type === 'horizontal' || type === 'vertical') {
      if (!isNaN(from.x) && !isNaN(from.y) && !isNaN(to.x) && !isNaN(to.y)) {
        return `M ${from.x},${from.y} L ${to.x},${to.y}`;
      }
    } else if (type === 'elbow') {
      if (!isNaN(from.x) && !isNaN(from.y) && !isNaN(to.x) && !isNaN(to.y)) {
        return `M ${from.x},${from.y} L ${to.x},${from.y} L ${to.x},${to.y}`;
      }
    }
    
    // Default straight line (if valid coords)
    if (!isNaN(from.x) && !isNaN(from.y) && !isNaN(to.x) && !isNaN(to.y)) {
      return `M ${from.x},${from.y} L ${to.x},${to.y}`;
    }
    
    // Fallback to empty path if coordinates are invalid
    return "M 0,0";
  }

  function drawDotsOnEdge(element, edge, count, radius, color, targetGroup) {
    if (!element) {
      console.warn('drawDotsOnEdge: element is null for edge', edge);
      return []; // Return empty array on failure
    }

    const dotsCoordinates = []; // Array to store coordinates
    const rect = element.getBoundingClientRect();
    const container = document.querySelector('.workflow-container');
    if (!container) {
        console.warn('drawDotsOnEdge: .workflow-container not found');
        return dotsCoordinates;
    }
    const containerRect = container.getBoundingClientRect();

    for (let i = 0; i < count; i++) {
      let x, y;
      const fraction = (i + 1) / (count + 1); // For 3 dots: 1/4, 2/4, 3/4

      if (edge === 'top') {
        y = rect.top - containerRect.top;
        x = (rect.left - containerRect.left) + rect.width * fraction;
      } else if (edge === 'bottom') {
        y = rect.bottom - containerRect.top;
        x = (rect.left - containerRect.left) + rect.width * fraction;
      } else {
        console.warn('drawDotsOnEdge: invalid edge specified', edge);
        continue;
      }

      dotsCoordinates.push({x, y});
    }
    return dotsCoordinates; // Return the array of coordinates
  }

  function animateMarkersOnPath(path, markerType = 'circle', markerCount = 1, markerColor, targetGroup = svg) {
    if (!path || !targetGroup || typeof path.getTotalLength !== 'function') {
      console.warn('animateMarkersOnPath: Invalid path or group');
      return;
    }
    
    const length = path.getTotalLength();
    if (length === 0 || !isFinite(length)) {
      console.warn('animateMarkersOnPath: Path has zero or invalid length');
      return;
    }
    
    const baseSpeed = 0.4; // Speed of marker movement
    
    for (let i = 0; i < markerCount; i++) {
      let marker;
      if (markerType === 'diamond') {
        marker = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        // Use CSS variable for diamond size
        const size = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--marker-diamond-size')) || 3;
        marker.setAttribute('points', `0,-${size} ${size},0 0,${size} -${size},0`);
        marker.setAttribute('class', 'marker-diamond');
        if (markerColor) {
          marker.setAttribute('style', `fill: ${markerColor} !important;`);
        }
      } else {
        marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        marker.setAttribute('class', 'marker-circle');
        if (markerColor) {
          marker.setAttribute('style', `fill: ${markerColor} !important;`);
        }
      }
      targetGroup.appendChild(marker);
      
      let progress = (length / markerCount) * i;
      const speed = baseSpeed + Math.random() * 0.2; // Add some randomness to speed
      
      function move() {
        progress += speed;
        if (progress > length) progress = 0;
        const pt = path.getPointAtLength(progress);
        if (!pt) {
          requestAnimationFrame(move);
          return;
        }
        
        if (markerType === 'diamond') {
          marker.setAttribute('transform', `translate(${pt.x},${pt.y})`);
        } else {
          marker.setAttribute('cx', pt.x);
          marker.setAttribute('cy', pt.y);
        }
        
        requestAnimationFrame(move);
      }
      
      move();
    }
  }

  function renderFlowLines() {
    if (!svg) {
      console.error('SVG element not found for workflow-page');
      return;
    }
    
    svg.innerHTML = '';

    const behindGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    behindGroup.setAttribute('id', 'flows-behind');
    svg.appendChild(behindGroup);

    const frontGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    frontGroup.setAttribute('id', 'flows-front');
    svg.appendChild(frontGroup);

    // Populate runtimeDots early for use in flow target resolution
    const runtimeSection = document.querySelector('.workstation-section.runtime');
    if (runtimeSection) {
      runtimeDots = drawDotsOnEdge(runtimeSection, 'bottom', 3, 3, 'white', frontGroup);
    } else {
      console.warn("Runtime section not found for dot drawing.");
      runtimeDots = []; 
    }

    flows.forEach(({ from, fromEdge, to, toEdge, pathType, dashed, controlPoints, id, strokeColor, markerFillColor, renderBehind, markerCount: flowMarkerCount }) => {
      let start;
      if (from === 'join') {
        start = getJoinPoint();
      } else if (from === 'logicFrameJoin') {
        start = getLogicFrameJoinPoint();
      } else if (from === 'joinParallelRuntime3') {
        start = getJoinParallelToRuntime3Point();
      } else if (typeof from === 'object' && from !== null) {
        start = getBoxEdge(from, fromEdge);
      } else {
        console.warn(`Invalid 'from' for flow with ID ${id || 'unknown'}`);
        return; // Skip this flow
      }
    
      let end;
      if (to === 'join') {
        end = getJoinPoint();
      } else if (to === 'logicFrameJoin') {
        end = getLogicFrameJoinPoint();
      } else if (to === 'joinParallelRuntime3') {
        end = getJoinParallelToRuntime3Point();
      } else if (to === 'verticalTargetFromJoinToRF2RightY') {
        const startPt = getJoinPoint();
        const targetPt = nodeMap.runtimeFeature2 ? getBoxEdge(nodeMap.runtimeFeature2, 'right') : {x: 0, y: 0};
        end = { x: startPt.x, y: targetPt.y };
      } else if (to === 'verticalTargetFromJoinParallelToRF3RightY') {
        const visualJoinX = getJoinPoint().x;
        const targetPt = nodeMap.runtimeFeature3 ? getBoxEdge(nodeMap.runtimeFeature3, 'right') : {x: 0, y: 0};
        end = { x: visualJoinX, y: targetPt.y };
      } else if (typeof to === 'object' && to !== null) {
        end = getBoxEdge(to, toEdge);
      } else {
        console.warn(`Invalid 'to' for flow with ID ${id || 'unknown'}`);
        return; // Skip this flow
      }

      try {
        const d = getPathD(start, end, pathType, controlPoints);
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let pathId = id || `flow-${(typeof from === 'string' ? from : (from && from.id ? from.id : 'unknown'))}-${(typeof to === 'string' ? to : (to && to.id ? to.id : 'unknown'))}`;
        
        path.setAttribute('id', pathId);
        path.setAttribute('d', d);
        
        // Apply classes and inline styles
        let pathClasses = [];
        if (dashed) pathClasses.push('dashed');
        if (pathClasses.length > 0) {
          path.setAttribute('class', pathClasses.join(' '));
        }
        
        if (strokeColor) path.setAttribute('stroke', strokeColor);
        
        const targetGroup = renderBehind ? behindGroup : frontGroup;
        targetGroup.appendChild(path);

        let markerType = 'circle';
        let markerCount = flowMarkerCount || 2; // Use flowMarkerCount if provided
        let finalMarkerColor = markerFillColor; 

        const cyanNodes = [nodeMap['frame'], nodeMap['optics'], nodeMap['automation'], nodeMap['plc'], nodeMap['gpu']];
        if (!finalMarkerColor && (cyanNodes.includes(from) || cyanNodes.includes(to))) {
          finalMarkerColor = '#00FFD0';
        }

        if ((to && typeof to !== 'string' && to.id === 'sw-input') || (typeof to === 'string' && to.includes('sw-input'))) {
          markerType = 'diamond';
          markerCount = 1;
        }
        
        animateMarkersOnPath(path, markerType, markerCount, finalMarkerColor, targetGroup);
      } catch (e) {
        console.error(`Error rendering flow with ID ${id || 'unknown'}:`, e);
      }
    });

    // Draw the join node (cyan circle with glow)
    const join = getJoinPoint();
    const joinCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    joinCircle.setAttribute('cx', join.x);
    joinCircle.setAttribute('cy', join.y);
    joinCircle.setAttribute('r', 8);
    joinCircle.setAttribute('fill', 'rgba(0, 255, 208, 0.8)');
    joinCircle.setAttribute('filter', 'drop-shadow(0 0 8px #00FFD0)');
    joinCircle.setAttribute('id', 'join-node');
    frontGroup.appendChild(joinCircle);

    // Draw the logicFrameJoin node
    const logicFrameJoinPt = getLogicFrameJoinPoint();
    const logicFrameJoinCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    logicFrameJoinCircle.setAttribute('cx', logicFrameJoinPt.x);
    logicFrameJoinCircle.setAttribute('cy', logicFrameJoinPt.y);
    logicFrameJoinCircle.setAttribute('r', 8);
    logicFrameJoinCircle.setAttribute('fill', 'rgba(0, 255, 208, 0.8)');
    logicFrameJoinCircle.setAttribute('filter', 'drop-shadow(0 0 8px #00FFD0)');
    logicFrameJoinCircle.setAttribute('id', 'logic-frame-join-node');
    frontGroup.appendChild(logicFrameJoinCircle);

    // Draw the joinParallelRuntime3 node
    const joinParallelRt3Pt = getJoinParallelToRuntime3Point();
    if (nodeMap.runtimeFeature3) {
      const joinParallelRt3Circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      joinParallelRt3Circle.setAttribute('cx', join.x);
      joinParallelRt3Circle.setAttribute('cy', joinParallelRt3Pt.y);
      joinParallelRt3Circle.setAttribute('r', 8);
      joinParallelRt3Circle.setAttribute('fill', 'rgba(0, 255, 208, 0.8)');
      joinParallelRt3Circle.setAttribute('filter', 'drop-shadow(0 0 8px #00FFD0)');
      joinParallelRt3Circle.setAttribute('id', 'join-parallel-runtime3-node');
      frontGroup.appendChild(joinParallelRt3Circle);
    }

    // Add dots to hardware sections
    const hardwareSection = document.querySelector('.workstation-section.hardware');
    if (hardwareSection) {
        hardwareDots = drawDotsOnEdge(hardwareSection, 'top', 3, 3, 'white', frontGroup);
    }

    // Debug points for runtime features
    const runtimeFeatures = document.querySelectorAll('[id^="runtime-feature-"]');
    runtimeFeatures.forEach(featureNode => {
      const pt = getBoxEdge(featureNode, 'right');
      const debugCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      debugCircle.setAttribute('cx', pt.x);
      debugCircle.setAttribute('cy', pt.y);
      debugCircle.setAttribute('r', 0); // Invisible - just for reference
      debugCircle.setAttribute('id', `debug-${featureNode.id}-right`);
      frontGroup.appendChild(debugCircle);
    });
  }

  // Add subtle glow effect to the right edge of runtime-feature-2 and runtime-feature-3
  function addRightSideGlowToRuntimeFeatures() {
    const rf2 = nodeMap.runtimeFeature2;
    const rf3 = nodeMap.runtimeFeature3;
    
    // Apply glowing effect to both elements
    [rf2, rf3].forEach(element => {
      if (!element) return;
      
      // Add subtle cyan glow to right edge
      element.style.boxShadow = "inset -4px 0 8px rgba(0, 255, 208, 0.4), 0 0 8px rgba(0, 255, 208, 0.2)";
      element.style.borderRight = "2px solid rgba(0, 255, 208, 0.7)";
      element.style.transition = "box-shadow 0.8s ease, border-right 0.8s ease";
    });
    
    // Add pulsing effect with slower animation
    let glowing = true;
    setInterval(() => {
      [rf2, rf3].forEach(element => {
        if (!element) return;
        
        if (glowing) {
          element.style.boxShadow = "inset -4px 0 10px rgba(0, 255, 208, 0.6), 0 0 10px rgba(0, 255, 208, 0.3)";
          element.style.borderRight = "2px solid rgba(0, 255, 208, 0.9)";
        } else {
          element.style.boxShadow = "inset -4px 0 6px rgba(0, 255, 208, 0.3), 0 0 6px rgba(0, 255, 208, 0.15)";
          element.style.borderRight = "2px solid rgba(0, 255, 208, 0.6)";
        }
      });
      glowing = !glowing;
    }, 3000);
  }

  // Add subtle glow effect to the left edge of runtimeFeature1
  function addConnectionGlowToRuntimeFeature1() {
    const rf1 = nodeMap.runtimeFeature1;
    if (!rf1) return;
    
    // Add subtle orange glow to left edge to show connection reception
    rf1.style.boxShadow = "inset 4px 0 8px rgba(252, 103, 7, 0.4), 0 0 8px rgba(252, 103, 7, 0.2)";
    rf1.style.borderLeft = "2px solid rgba(252, 103, 7, 0.7)";
    rf1.style.transition = "box-shadow 0.8s ease, border-left 0.8s ease";
    
    // Add pulsing effect with slower animation
    let glowing = true;
    setInterval(() => {
      if (!rf1) return;
      if (glowing) {
        rf1.style.boxShadow = "inset 4px 0 10px rgba(252, 103, 7, 0.6), 0 0 10px rgba(252, 103, 7, 0.3)";
        rf1.style.borderLeft = "2px solid rgba(252, 103, 7, 0.9)";
      } else {
        rf1.style.boxShadow = "inset 4px 0 6px rgba(252, 103, 7, 0.3), 0 0 6px rgba(252, 103, 7, 0.15)";
        rf1.style.borderLeft = "2px solid rgba(252, 103, 7, 0.6)";
      }
      glowing = !glowing;
    }, 3000);
  }

  // Inference runtime SVG connector logic for grid layout
  function renderRuntimeConnectors() {
    const runtimeSvg = document.getElementById('runtimeSVG');
    if (!runtimeSvg) return;
    runtimeSvg.innerHTML = '';
    const center = document.getElementById('inference-center');
    const nodeIds = ['sw-model', 'sw-input', 'sw-infer', 'sw-result', 'sw-judge'];
    nodeIds.forEach(id => {
      const node = document.getElementById(id);
      if (!node || !center) return;
      const cRect = center.getBoundingClientRect();
      const nRect = node.getBoundingClientRect();
      const svgRect = runtimeSvg.getBoundingClientRect();
      // Center of main circle
      const cx = cRect.left + cRect.width / 2 - svgRect.left;
      const cy = cRect.top + cRect.height / 2 - svgRect.top;
      // Center of node
      const nx = nRect.left + nRect.width / 2 - svgRect.left;
      const ny = nRect.top + nRect.height / 2 - svgRect.top;
      // Draw connector
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${cx},${cy} L ${nx},${ny}`);
      path.setAttribute('stroke', '#00FFD0');
      path.setAttribute('stroke-width', '2.5');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('filter', 'drop-shadow(0 0 6px #00FFD0)');
      runtimeSvg.appendChild(path);
    });
  }

  // Initialize workflow visualization
  if (document.body.classList.contains('workflow-page')) {
    window.addEventListener('DOMContentLoaded', () => {
      console.log('DOMContentLoaded for workflow-page');
      renderFlowLines();
      renderRuntimeConnectors();
      addConnectionGlowToRuntimeFeature1();
      addRightSideGlowToRuntimeFeatures();
    });
    
    window.addEventListener('resize', () => {
      setTimeout(renderFlowLines, 250);
      setTimeout(renderRuntimeConnectors, 250);
      setTimeout(addConnectionGlowToRuntimeFeature1, 250);
      setTimeout(addRightSideGlowToRuntimeFeatures, 250);
    });
  }
})();
class EasingCanvas {
    namespace = 'http://www.w3.org/2000/svg';
    dragging = undefined;
    snapping = false;
    snappingSnap = 0.05;
    fix = false;
    fixX = false;
    fixY = false;
    fixDistance = 10;
    dom = {
        wrapper: null,
        guide_top_path: document.createElementNS(this.namespace, 'path'),
        guide_bottom_path: document.createElementNS(this.namespace, 'path'),
        svg: document.createElementNS(this.namespace, 'svg'),
        path: document.createElementNS(this.namespace, 'path'),
        pre_path: document.createElementNS(this.namespace, 'path'),

        helper1_circle: document.createElementNS(this.namespace, 'circle'),
        helper1_path: document.createElementNS(this.namespace, 'path'),

        helper2_circle: document.createElementNS(this.namespace, 'circle'),
        helper2_path: document.createElementNS(this.namespace, 'path'),
        helper_guides: []
    }
    style = {
        margin: 60
    }
    eventListener = {
        render: []
    }
    //c dx1, dy1 dx2, dy2 dx, dy
    path = {
        x1: 0.22,
        y1: .72,
        x2: 0,
        y2: 1
    }
    dist = {
        status: false,
        init: [0, 0],
        diff: [0, 0]
    }
    constructor(dom) {
        this.dom.wrapper = dom;

        var guidesCnt = (1 / this.snappingSnap) * 2;
        for (var i = 0; i < guidesCnt; i++) {
            var guidePath = document.createElementNS(this.namespace, 'path');
            guidePath.setAttribute('stroke', '#888');
            guidePath.setAttribute('stroke-dasharray', '3,4');
            this.dom.svg.appendChild(guidePath);
            this.dom.helper_guides.push(guidePath);
        }
        this.dom.wrapper.appendChild(this.dom.svg);

        this.dom.guide_top_path.setAttribute('stroke', '#888888');
        this.dom.guide_top_path.setAttribute('stroke-dasharray', '10,5');
        this.dom.guide_bottom_path.setAttribute('stroke', '#888888');
        this.dom.guide_bottom_path.setAttribute('stroke-dasharray', '10,5');

        this.dom.svg.append(this.dom.guide_top_path, this.dom.guide_bottom_path, this.dom.pre_path, this.dom.path, this.dom.helper1_path, this.dom.helper2_path, this.dom.helper1_circle, this.dom.helper2_circle);
        this.dom.path.setAttribute('stroke', '#B3F2BD');
        this.dom.path.setAttribute('stroke-width', '5');
        this.dom.path.setAttribute('fill', 'none');

        this.dom.pre_path.setAttribute('stroke', 'red');
        this.dom.pre_path.setAttribute('stroke-width', '5');
        this.dom.pre_path.setAttribute('fill', 'none');

        this.dom.helper1_circle.setAttribute('fill', '#D9B29C');
        this.dom.helper1_circle.setAttribute('r', '8');
        this.dom.helper2_circle.setAttribute('fill', 'skyblue');
        this.dom.helper2_circle.setAttribute('r', '8');

        this.dom.helper1_path.setAttribute('stroke', '#D9B29C');
        this.dom.helper1_path.setAttribute('fill', 'none');
        this.dom.helper1_path.setAttribute('stroke-width', '2');

        this.dom.helper2_path.setAttribute('stroke', 'skyblue');
        this.dom.helper2_path.setAttribute('fill', 'none');
        this.dom.helper2_path.setAttribute('stroke-width', '2');

        this.dom.helper1_circle.id = 'helper_1';
        this.dom.helper2_circle.id = 'helper_2';
        this.dom.helper1_circle.style.cursor = 'pointer';
        this.dom.helper2_circle.style.cursor = 'pointer';


        this.dom.wrapper.addEventListener('mousedown', (e) => {
            e.preventDefault();
            if (e.target.id == 'helper_1') {
                this.dragging = 'helper_1';
            } else if (e.target.id == 'helper_2') {
                this.dragging = 'helper_2';
            }
            this.dist.status = true;
            this.dist.init = [e.clientX, e.clientY];
            this.dist.diff = [0, 0];
            this.fixX = false
            this.fixY = false
            this.render();
        })
        this.dom.wrapper.addEventListener('mousemove', (e) => {
            e.preventDefault();
            this.dist.diff = [e.clientX - this.dist.init[0], e.clientY - this.dist.init[1]];
            if (this.dist.status && this.fix) {
                if (Math.abs(this.dist.diff[0]) > this.fixDistance && !this.fixY) {
                    this.fixX = true
                }
                if (Math.abs(this.dist.diff[1]) > this.fixDistance && !this.fixX) {
                    this.fixY = true;
                }
                console.log(this.fixX, this.fixY)
            }
            if (this.dragging == 'helper_1') {
                var x1 = ((e.clientX - (this.dom.svg.getBoundingClientRect().x + this.style.margin)) / this.width);
                var y1 = (1 - (e.clientY - (this.dom.svg.getBoundingClientRect().y + this.style.margin)) / this.height);
                if (this.snapping) {
                    x1 = Math.round(x1 / this.snappingSnap) * this.snappingSnap;
                    y1 = Math.round(y1 / this.snappingSnap) * this.snappingSnap;
                }
                if ((!this.fix) || (this.fix && this.fixX)) this.path.x1 = x1
                if ((!this.fix) || (this.fix && this.fixY)) this.path.y1 = y1

                this.render();
            } else if (this.dragging == 'helper_2') {
                var x2 = ((e.clientX - (this.dom.svg.getBoundingClientRect().x + this.style.margin)) / (this.width));
                var y2 = (1 - (e.clientY - (this.dom.svg.getBoundingClientRect().y + + this.style.margin)) / this.height);

                if (this.snapping) {
                    x2 = Math.round(x2 / this.snappingSnap) * this.snappingSnap;
                    y2 = Math.round(y2 / this.snappingSnap) * this.snappingSnap;
                }
                if ((!this.fix) || (this.fix && this.fixX)) this.path.x2 = x2;
                if ((!this.fix) || (this.fix && this.fixY)) this.path.y2 = y2;
                this.render();
            }
        })
        this.dom.wrapper.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.dragging = undefined;
            this.dist.status = false;
            this.fixX = false
            this.fixY = false
            this.render();
        })
        this.dom.wrapper.addEventListener('mouseleave', (e) => {
            e.preventDefault();
            this.dragging = undefined;
            this.dist.status = false;
            this.fixX = false
            this.fixY = false
            this.render();
        })
        document.body.addEventListener('keydown', (e) => {
            if (e.key == 'Control' || e.key == 'Meta') {
                this.snapping = true;
            }
            if (e.key == 'Shift') {
                this.fix = true;
            }
        })
        document.body.addEventListener('keyup', (e) => {
            if (e.key == 'Control' || e.key == 'Meta') {
                this.snapping = false;
            }
            if (e.key == 'Shift') {
                this.fix = false;
            }
        })
        this.render();
    }
    get width() {
        return this.dom.svg.getBoundingClientRect().width - this.style.margin * 2
    }
    get height() {
        return this.dom.svg.getBoundingClientRect().height - this.style.margin * 2
    }
    set(x1, y1, x2, y2) {
        this.path = { x1: x1 || 0, y1: y1 || 0, x2: x2 || 0, y2: y2 || 0 };
        this.render();
    }
    render() {
        this.dom.path.setAttribute('d', `M ${this.style.margin}, ${this.style.margin + this.height} C 
  ${this.style.margin + this.width * this.path.x1}, ${this.style.margin + this.height - this.height * this.path.y1}
  ${this.style.margin + this.width * this.path.x2}, ${this.style.margin + this.height - this.height * this.path.y2}
  ${this.style.margin + this.width}, ${this.style.margin}`);
        this.dom.pre_path.setAttribute('d', `M ${this.style.margin}, ${this.style.margin + this.height} C 
  ${this.style.margin + this.width * this.path.x1}, ${this.style.margin + this.height - this.height * this.path.y1}
  ${this.style.margin + this.width * this.path.x2}, ${this.style.margin + this.height - this.height * this.path.y2}
  ${this.style.margin + this.width}, ${this.style.margin}`);
        this.dom.helper1_circle.setAttribute('cx', `${this.style.margin + this.width * this.path.x1}`)
        this.dom.helper1_circle.setAttribute('cy', `${this.style.margin + this.height - this.height * this.path.y1}`)
        this.dom.helper2_circle.setAttribute('cx', `${this.style.margin + this.width * this.path.x2}`)
        this.dom.helper2_circle.setAttribute('cy', `${this.style.margin + this.height - this.height * this.path.y2}`)
        this.dom.helper1_path.setAttribute('d', `M ${this.style.margin}, ${this.style.margin + this.height} 
  ${this.style.margin + this.width * this.path.x1}, ${this.style.margin + this.height - this.height * this.path.y1}`);
        this.dom.helper2_path.setAttribute('d', `M ${this.style.margin + this.width}, ${this.style.margin}
  ${this.style.margin + this.width * this.path.x2}, ${this.style.margin + this.height - this.height * this.path.y2}`);
        this.dom.guide_top_path.setAttribute('d', `M ${this.style.margin}, ${this.style.margin} ${this.style.margin + this.width}, ${this.style.margin}`);
        this.dom.guide_bottom_path.setAttribute('d', `M ${this.style.margin}, ${this.style.margin + this.height} ${this.style.margin + this.width}, ${this.style.margin + this.height}`);

        var guidesCnt = this.dom.helper_guides.length;
        for (var i = 0; i < guidesCnt / 2; i++) {
            this.dom.helper_guides[i].setAttribute('d', `M ${this.style.margin + (this.width / guidesCnt * 2 * (i + 1))}, ${this.style.margin} ${this.style.margin + (this.width / guidesCnt * 2 * (i + 1))}, ${this.style.margin + this.height}`);
        }
        for (var i = guidesCnt / 2; i < guidesCnt; i++) {
            this.dom.helper_guides[i].setAttribute('d', `M ${this.style.margin}, ${this.style.margin + (this.height / guidesCnt * 2 * (i + 1)) - this.height} ${this.style.margin + this.width}, ${this.style.margin + (this.height / guidesCnt * 2 * (i + 1) - this.height)}`);
        }
        for (var i in this.eventListener.render) {
            this.eventListener.render[i](this.path);
        }
    }
}
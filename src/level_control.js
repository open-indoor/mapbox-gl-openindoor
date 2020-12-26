export default class LevelControl {
  constructor(openindoor) {
    this.openindoor = openindoor;
    this._cbRefresh = () => this._refresh();
    this.openindoor.on('levelschange', this._cbRefresh);
    this.openindoor.on('levelchange', this._cbRefresh);

    this.$el = document.createElement('div');
    this.$el.classList.add('mapboxgl-ctrl', 'mapboxgl-ctrl-group', 'mapboxgl-ctrl-openindoor');
    this._refresh();
  }

  destroy() {
    this.$el.remove();
    this.openindoor.off('levelschange', this._cbRefresh);
    this.openindoor.off('levelchange', this._cbRefresh);
  }

  _refresh() {
    this.$el.innerHTML = '';
    if (this.openindoor.levels.length === 1) {
      return;
    }
    const buttons = this.openindoor.levels.map((level) => {
      const button = document.createElement('button');
      const strong = document.createElement('strong');
      strong.textContent = level;
      button.appendChild(strong);
      if (level == this.openindoor.level) {
        button.classList.add('mapboxgl-ctrl-active');
      }
      button.addEventListener('click', () => {  this.openindoor.setLevel(level); })
      this.$el.appendChild(button);
    });
  }
}

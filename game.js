 //FAR FROME HOME

 // Scene Names:

 // Non Adventure - intro, endDeath, endWar, endPeace

 // Adventure Scenes - hub, xs62, canyon, r40, town, belabog, moon, moonbase, secretRoom

const W = 1920;
const H = 1080;


class Intro extends Phaser.Scene {
    constructor() {
        super("intro");
    }

    create() {

        //setup
        this.W = W;
        this.H = H;
        this.cameras.main.setBackgroundColor('#040417');
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.introTrans = false;
        this.count = 0;
        //create random stars
        this.stars = [];
        for(let i = 0; i < 200; i++) {
            this.stars.push({
                x: Math.random() * this.W,
                y: Math.random() * this.H,
                r: Math.random() * 2,
            });
        }
        this.grfx = this.add.graphics();

        //Earth
        this.earth = this.add.circle(this.W * 0.5, this.H * 0.5, 100, 0x2233ee);
        this. land = this.add.circle(this.W * 0.48, this.H * 0.46, 45, 0x21872a);
        this.land2 = this.add.circle(this.W * 0.52, this.H * 0.55, 30, 0x21872a);

        this.earthGroup = [this.earth, this.land, this.land2];

        //Title
        const title = this.add.text(this.W * 0.5, this.H * 0.15, "FAR FROM HOME", {
                fontSize: '128px', color: '#ffffff', fontStyle: 'bold',
                stroke: '#001122', strokeThickness: 5
            }).setOrigin(0.5).setAlpha(0);
        //Start
        const clickToStart = this.add.text(this.W * 0.5, this.H * 0.90, "Click to Launch!", {
            fontSize: '35px', color: '#cacce3', 
            stroke: '#001122', strokeThickness: 5
        }).setOrigin(0.5).setAlpha(0);
        //Intro Fade
        this.tweens.add({ targets: [title, clickToStart], alpha: 1, duration: 2000, delay: 500 });
        this.tweens.add({ targets: this.earthGroup, alpha: 1, duration: 2000, delay: 1000 });

        //Transition to Hub
        this.input.once('pointerdown', () => {
            this.introTrans = true;
            this.tweens.add({ targets: [title, clickToStart], alpha: 0, duration: 2000,       
             });
                this.tweens.add({ targets: this.earthGroup, alpha: 0, scale: 0, duration: 3000, onComplete: () => {
                    this.scene.start('hub', {inventory: []});
                } 
            });
        });
    }

    update(time, delta) {
        //setup
        this.grfx.clear();
        const W = this.W;
        const H = this.H;
        //create stars
        if(!this.introTrans) {
            for(let star of this.stars) {
                this.grfx.fillStyle(0xffffff, star.r / 2);
                this.grfx.fillCircle(star.x, star.y, star.r);
            }
        } else { //when transition starts, stars expand, earth shrinks.
            this.lightspeedTimer += delta;
            const cx = W * 0.5;
            const cy = H * 0.5;
            for(let star of this.stars) {
                //try to make stars strech out from the center of screen with tween
                const angle = Math.atan2(star.y - cy, star.x - cx);
                star.x += Math.cos(angle) * 30 * delta * 0.01;
                star.y += Math.sin(angle) * 30 * delta * 0.01;
                this.grfx.fillStyle(0xffffff, star.r / 2);
                this.grfx.fillCircle(star.x, star.y, star.r);
                //couldent figure out strech so made them move outwards.
            }
        }
    }
}

class Hub extends AdventureScene {
    constructor() {super('hub', 'Spaceship Hub'); }

    onEnter() {
        const w = this.w;
        const h = this.h;
        const s = this.s;
        this.cameras.main.setBackgroundColor('#1a1a1e');

        //Items
        let scanner = this.add.text(this.w * 0.35, this.h * 0.3, '🔬 Scanner', { fontSize: '32px', color: '#ffffff'})
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerover', () => {
                this.showMessage("It's a scanner used to collect information about planets.")
            })
            .on('pointerdown', () => {
                this.showMessage("You aquired the scanner.");
                this.gainItem('🔬 Scanner');
                this.tweens.add({
                    targets: scanner,
                    y: `-=${20}`,
                    alpha: { from: 1, to: 0 },
                    duration: 500,
                    onComplete: () => scanner.destroy()
                });
            });
        //Console UI
        this.add.rectangle(w * 0.375, h * 0.74, 50 * s, 16 * s, 0x060e1a)
            .setStrokeStyle(s * 0.2, 0x1a3355);
        this.add.text(w * 0.375, h * 0.65, '- Navigation Console -', {
            fontSize: '32px', color: '#394f64'
        }).setOrigin(0.5);
        //Planets
         const planets = [ //creat dict of planets with name, color, x position, and tip to reduce redundancy
            { key: 'xs26', name: '🟢 XS-26', col: '#44bb44', x: w * 0.21,
              tip: 'XS-26: Vivid green planet. Something unusual is out there.' },
            { key: 'r40', name: '🔴 R-40', col: '#cc5533', x: w * 0.375,
              tip: 'R-40: Red desert world. Our radar suggest structes beneath the dunes.' },
            { key: 'belabog', name: '🔵 Belabog', col: '#4499cc', x: w * 0.54,
              tip: 'Belabog: Frozen but promising. Most Earth-like in the system.' },
        ];

        for (const p of planets) {
            const button = this.add.text(p.x, h * 0.755, `${p.name}`, {
                fontSize: `${2.3 * s}px`, color: p.col
            }).setOrigin(0.5).setInteractive()
            .on('pointerover', () => this.showMessage(p.tip))
            .on('pointerdown', () => {
                if (!this.hasItem('🔬 Scanner')) {
                    this.showMessage('Grab the scanner first.');
                    this.tweens.add({ targets: button, x: button.x + s * 0.7, yoyo: true, repeat: 4, duration: 55 });
                } else {
                    this.gotoScene(p.key);
                }
            });
        }     
    }
    //Secret Room

    //Planet Scenes
}

const game = new Phaser.Game({
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080
    },
    scene: [Hub],
    title: "Adventure-Game",
});


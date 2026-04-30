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

        }
    }
}
const game = new Phaser.Game({
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080
    },
    scene: [Intro],
    title: "Adventure-Game",
});


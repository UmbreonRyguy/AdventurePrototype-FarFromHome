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
        //Info 
        const info = this.add.text(W * 0.5, H * 0.78, 
            'Your mission is to explore and chart data about 3 planets. \n Assess each planet for survivability and return home safely.', {
            fontSize: '32px', color: '#576a7a', align: 'center'
        }).setOrigin(0.5).setAlpha(0);
        //Start
        const clickToStart = this.add.text(this.W * 0.5, this.H * 0.90, "Click to Launch!", {
            fontSize: '35px', color: '#cacce3', 
            stroke: '#001122', strokeThickness: 5
        }).setOrigin(0.5).setAlpha(0);
        //Intro Fade
        this.tweens.add({ targets: [title, clickToStart, info], alpha: 1, duration: 2000, delay: 500 });
        this.tweens.add({ targets: this.earthGroup, alpha: 1, duration: 2000, delay: 1000 });

        //Transition to Hub
        this.input.once('pointerdown', () => {
            this.introTrans = true;
            this.tweens.add({ targets: [title, clickToStart, info], alpha: 0, duration: 2000,       
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
            
            //Partner Suggestion
            this.add.text(w * 0.2, h * 0.45, '🌌 Look outside through porthole', {
            fontSize: '32px', color: '#3b59ac'
            }).setInteractive()
            .on('pointerover', () => this.showMessage('You can see stars twinkling in the distance and 3 planets in view.'));



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
                fontSize: '40px', color: p.col
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
}
    //Secret Room

    //Planet Scenes
 class PlanetXS26 extends AdventureScene {
      constructor() { super('xs26', 'Planet XS-26');}
      
      onEnter() {
        const w = this.w, h = this.h, s = this.s;
        this.cameras.main.setBackgroundColor('#152b18');

        //Scan
        this.add.text(w * 0.07, h * 0.47, '🔬 scan planet', {
            fontSize: '40px', color: '#44bb44'
        }).setInteractive()
        .on('pointerover', () => this.showMessage('Run the scanner to analyse XS-26\'s survivability.'))
        .on('pointerdown', () => {
            if(!this.scanned) {
                this.scanPlanet('xs26', () => {
                    this.scanned = true;
                    this.showMessage('Scan complete! XS-26 is uninhabitable')
                })
            }else{
                this.showMessage('Already scanned! XS-26 is uninhabitable.')
            }
        })
        //Planet Features
         this.add.text(w * 0.5, h * 0.13, '🌫️ Toxic Clouds', {
            fontSize: '40px', color: '#1a4020'
        }).setInteractive()
        .on('pointerover', () => this.showMessage('The sky is covered with green tinted clouds. Visibility is very dim.'));

        this.add.text(w * 0.28, h * 0.74, '🪨 Crystal Formation', {
            fontSize: '40px', color: '#336633'
        }).setInteractive()
        .on('pointerover', () => this.showMessage(
            'Translucent green crystals emerge from the soil. They vibrate at a very low frequency, which you can feel through your spacesuit.'))

        
        this.add.text(w * 0.32, h * 0.61, '☣️ toxic river', {
            fontSize: '40px', color: '#2be61e'
        }).setInteractive()
        .on('pointerover', () => this.showMessage(
            'A river flowing with glowing green bubbling liquid. Collect a sample?'))
        .on('pointerdown', () => {
            if (this.hasItem('🧪 xs26 sample')) {
                this.showMessage('Sample already collected.');
            } else if (!this.scanned) {
                this.showMessage('Run a planet scan first — sample collecting requires planetary data.');
            } else {
                this.collectSample(0x60ff44, '🧪 XS-26 sample', () => {
                    this.showMessage('River sample collected.');
                });
            }
        });
        
        //Canyon Item
        this.add.text(w * 0.58, h * 0.44, '⛰️ Canyon >', {
            fontSize: '40px', color: '#558855'
        }).setInteractive()
        .on('pointerover', () => this.showMessage('A massive canyon is just ahead. There is no visible bottom due to the thick clouds.'))
        .on('pointerdown', () => this.gotoScene('canyon'));

        this.add.text(w * 0.05, h * 0.09, '🚀 back to Hub', {
        fontSize: '40px', color: '#f7f7f7'
        }).setInteractive()
        .on('pointerover', () => this.showMessage('Return to the ship'))
        .on('pointerdown', () => this.gotoScene('hub'));
      }
    }

class Canyon extends AdventureScene {
    constructor() { super('canyon', 'XS-26 Canyon'); }

        onEnter(){
            const w = this.w, h = this.h, s = this.s;
            this.cameras.main.setBackgroundColor('#152b18');

            this.add.text(w * 0.365, h * 0.28, '👁️ peer into the canyon', {
            fontSize: '40px', color: '#467a46'
            }).setOrigin(0.5).setInteractive()
            .on('pointerover', () => this.showMessage('A faint green glow emenates from somewhere far below.'))
            .on('pointerdown', () => this.showMessage('The darkness echoes back. Something rattles from the depths, do you have the nerve to venture down?.'));


            this.add.text(w * 0.05, h * 0.09, '< back to XS-26', {
            fontSize: '40px', color: '#f7f7f7'
            }).setInteractive()
            .on('pointerover', () => this.showMessage('Return to the surface of XS-26.'))
            .on('pointerdown', () => this.gotoScene('xs26'));

        }

}

 class PlanetR40 extends AdventureScene {
      constructor() { super('r40', 'Planet R-40');}
      
      onEnter() {
        const w = this.w, h = this.h, s = this.s;
        this.cameras.main.setBackgroundColor('#291010');

        //Scan
        this.add.text(w * 0.07, h * 0.47, '🔬 scan planet', {
            fontSize: '40px', color: '#bf2e2e'
        }).setInteractive()
        .on('pointerover', () => this.showMessage('Run the scanner to analyse R-40\'s survivability.'))
        .on('pointerdown', () => {
            if(!this.scanned) {
                this.scanned = true;
                this.scanPlanet('r40', () => {
                    this.showMessage('Scan complete! R-40 is uninhabitable.');
                });
            }else{
                this.showMessage('Already scanned! R-40 is uninhabitable.')
            }
        })
        //features
        this.add.text(w * 0.24, h * 0.7, '🏜️ red dunes', {
            fontSize: '40px', color: '#aa4422'
        }).setInteractive()
        .on('pointerover', () => this.showMessage(
            'Sweeping red dunes stretch past the horizon. Wind blows up dust into your face as you take in your surroundings.'));
        
        //sample
        this.add.text(w * 0.32, h * 0.81, '🧱 collect sand sample', {
            fontSize: '40px', color: '#d1a23d'
        }).setInteractive()
        .on('pointerover', () => this.showMessage(
            'Theres sand around you for as far as you can see. Collect a sample?'))
        .on('pointerdown', () => {
            if (this.hasItem('🧪 R-40 sample')) {
                this.showMessage('Sample already collected.');
            } else if (!this.scanned) {
                this.showMessage('Run a planet scan first — sample collecting requires planetary data.');
            } else {
                this.collectSample(0xe94f2c, '🧪 r40 sample', () => {
                    this.showMessage('Sand sample collected.');
                });
            }
        });
        //items

        let alienRing = this.add.text(this.w * 0.35, this.h * 0.3, '💍 Alien ring', { fontSize: '32px', color: '#ffffff'})
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerover', () => {
                this.showMessage("Something glitters through the dust.")
            })
            .on('pointerdown', () => {
                this.showMessage("You aquired a mysterious ring.");
                this.gainItem('💍 Alien ring');
                this.tweens.add({
                    targets: alienRing,
                    y: `-=${20}`,
                    alpha: { from: 1, to: 0 },
                    duration: 500,
                    onComplete: () => alienRing.destroy()
                });
            });
        this.add.text(w * 0.5, h * 0.5, '🏛️ engraved symbols', {
                fontSize: '40px', color: '#664422'
            }).setInteractive()
            .on('pointerover', () => this.showMessage(
                'You\'re able to make out a string of characters carved deep into a pillar jutting through the red sand'))
            .on('pointerdown', () => {
                this.showMessage('You record the code, XI-776.');
                this.gainItem('📝 code: XI-776');
            });
        
        
        this.add.text(w * 0.05, h * 0.09, '🚀 back to Hub', {
        fontSize: '40px', color: '#f7f7f7'
        }).setInteractive()
        .on('pointerover', () => this.showMessage('Return to the ship'))
        .on('pointerdown', () => this.gotoScene('hub'));
        }
    }
 class PlanetBelabog extends AdventureScene {
      constructor() { super('belabog', 'Planet Belabog');}
      
      onEnter() {
        const w = this.w, h = this.h, s = this.s;
        this.cameras.main.setBackgroundColor('#223235');
        
        this.add.text(w * 0.48, h * 0.56, '❄️ ice formation', {
            fontSize: '40px', color: '#225577'
        }).setInteractive()
        .on('pointerover', () => this.showMessage(
            'Towering blue ice spires wayne down over you as far as the eye can see'))
        .on('pointerdown', () => this.showMessage('Your glove comes away coated in small ice crystals.'));

        this.add.text(w * 0.07, h * 0.47, '🔬 scan planet', {
            fontSize: '40px', color: '#4448bb'
        }).setInteractive()
        .on('pointerover', () => this.showMessage('Run the scanner to analyse Belabog\'s survivability.'))
        .on('pointerdown', () => {
            if(!this.scanned) {
                this.scanned = true;
                this.scanPlanet('belabog', () => {
                    this.showMessage('Scan complete!');
                })
            }else{
                this.showMessage('Already scanned! Belabog is the most promising, however the cold would kill in an instant.')
            }
        })
        this.add.text(w * 0.32, h * 0.71, '🧊 frozen lake', {
            fontSize: '40px', color: '#3388bb'
        }).setInteractive()
        .on('pointerover', () => this.showMessage(
            'Thick layer of ice with what appears to be water below. Collect a sample?'))
        .on('pointerdown', () => {
            if (this.hasItem('🧪 belabog sample')) {
                this.showMessage('Sample already collected.');
            } else if (!this.scanned) {
                this.showMessage('Run a planet scan first — sample collecting requires planetary data.');
            } else {
                this.collectSample(0x44aaff, '🧪 belabog sample', () => {
                    this.showMessage('Ice sample collected.');
                });
            }
        });

        this.add.text(w * 0.5, h * 0.09, '🌙 travel to moon', {
        fontSize: '40px', color: '#98aedd'
        }).setInteractive()
        .on('pointerover', () => this.showMessage('Visit Belabog\'s moon'))
        .on('pointerdown', () => this.gotoScene('moon'));


        this.add.text(w * 0.05, h * 0.09, '🚀 back to Hub', {
        fontSize: '40px', color: '#f7f7f7'
        }).setInteractive()
        .on('pointerover', () => this.showMessage('Return to the ship'))
        .on('pointerdown', () => this.gotoScene('hub'));
      }
    }
class Moon extends AdventureScene {
    constructor() { super('moon', "Belabog's Moon"); }

    onEnter() {
        const w = this.w, h = this.h, s = this.s;
        this.cameras.main.setBackgroundColor('#252529');


        this.add.text(w * 0.3, h * 0.5, '🏛️ massive alien structure', {
        fontSize: '40px', color: '#565e71'
        }).setInteractive()
        .on('pointerover', () => this.showMessage('A masive structure looms before you. A large plaque states \"Recite the Code of Knowlege to be granted entry\". Enter?'))
        .on('pointerdown', () => {
            if(this.hasItem('📝 code: XI-776')){
                this.gotoScene('moonbase');
            } else {
                this.showMessage("Only those with the knowlege of our code may enter");
            }
        }    
    );






        this.add.text(w * 0.05, h * 0.09, '< back to Belabog', {
            fontSize: '40px', color: '#f7f7f7'
            }).setInteractive()
            .on('pointerover', () => this.showMessage('Return to the surface of Belabog.'))
            .on('pointerdown', () => this.gotoScene('belabog'));
    }
}

class MoonBase extends AdventureScene {
    constructor() {super('moonbase', 'Inside the Moonbase')}

    onEnter(){
    const w = this.w, h = this.h, s = this.s;
    this.cameras.main.setBackgroundColor('#030310');
    

    const aliens = this.add.text(w * 0.375, h * 0.25, '👾  👾  👾', {
            fontSize: '80px'
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerover', () => this.showMessage(
            'Tall alien beings with large dark eyes tower before you with weapons drawn. They\'re waiting for you to act.'));

        this.add.text(w * 0.375, h * 0.42, 'Three beings level their weapons at you.', {
            fontSize: '40px', color: '#5544aa'
        }).setOrigin(0.5);

        this.add.text(w * 0.375, h * 0.51, '- What do you present to the aliens? -', {
            fontSize: '50px', color: '#7766bb', fontStyle: 'bold'
        }).setOrigin(0.5);

        //Ending Choices
        let choiceY = h * 0.6;
        //Present Ring
         if (this.hasItem('💍 Alien ring')) {
            const ringBtn = this.add.text(w * 0.375, choiceY, '💍  Hold out the alien ring', {
                fontSize: '45px', color: '#ddcc44'
            }).setOrigin(0.5).setInteractive()
            .on('pointerover', () => this.showMessage(
                'The ring bears a symbol the same as the carvings inside this structure. Maybe it means something to them.'))
            .on('pointerdown', () => {
                this.showMessage('One of the beings gasps. All three lower their weapons...');
                this.loseItem('💍 Alien ring');
                this.cameras.main.fade(1800, 0, 0, 0);
                this.time.delayedCall(2000, () => this.scene.start('endingPeace'));
            });
            choiceY += 5.5 * s;
        }
        //Present a Sample
        const sampleChoices = [
            { item: '🧪 xs26 sample',    label: 'Hold out the XS-26 sample' },
            { item: '🧪 r40 sample',     label: 'Hold out the R-40 sample'  },
            { item: '🧪 belabog sample', label: 'Hold out the Belabog sample' },
        ].filter(c => this.hasItem(c.item));

        if (sampleChoices.length > 0) {
            const sc = sampleChoices[0];
            const sBtn = this.add.text(w * 0.375, choiceY, `🧪  ${sc.label}`, {
                fontSize: '45px', color: '#44aa55'
            }).setOrigin(0.5).setInteractive()
            .on('pointerover', () => this.showMessage(
                'A vial of material colected from their galaxy. Show them what you\'ve collected. How will they react?'))
            .on('pointerdown', () => {
                this.showMessage('The aliens retaliate violently. They think you\'re threatening them!');
                this.cameras.main.fade(1500, 255, 0, 0);
                this.time.delayedCall(1700, () => this.scene.start('endingWar'));
            });
            choiceY += 5.5 * s;
        }
    }
}

//Ending Scene Peace
class EndingPeace extends Phaser.Scene {
    constructor() { super('endingPeace');}

    create() {
        this.cameras.main.setBackgroundColor('#126127');
        this.cameras.main.fadeIn(2000, 0, 0, 0);
        this.add.text(W * 0.5, H * 0.18, '🌌🤝👾', { fontSize: '106px' }).setOrigin(0.5);
        this.add.text(W * 0.12, H * 0.505, 
            'The aliens recognised the ring which was a relic of their ancient society.\n They lowered their weapons and let you leave. \n You return to Earth as the first space ambassador.', {fontSize: '33px', color: '#000000', align: 'center'})
    }
}
//Ending Scene War
class EndingWar extends Phaser.Scene {
    constructor() { super('endingWar');}

    create() {
        this.cameras.main.setBackgroundColor('#581515');
        this.cameras.main.fadeIn(2000, 0, 0, 0);
        this.add.text(W * 0.5, H * 0.18, '🚀💥👾', { fontSize: '106px' }).setOrigin(0.5);
        this.add.text(W * 0.25, H * 0.505, 
            'The aliens saw your offering as a sign of war.\n They drew their weapons against you and attacked. \n The aliens then enacted an invation of earth.', {fontSize: '33px', color: '#000000', align: 'center'})
    }
}

const game = new Phaser.Game({
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080
    },
    scene: [Intro, Hub, PlanetXS26, PlanetR40, PlanetBelabog, Canyon, Moon, MoonBase, EndingPeace, EndingWar], 
    title: "root",
});


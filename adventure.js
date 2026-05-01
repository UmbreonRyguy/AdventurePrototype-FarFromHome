/**
 * A tiny framework dedicated to tiny adventure games.
 *
 * `AdventureScene` is a Phaser scene that provides:
 *   - an inventory of named string items carried between scenes,
 *   - a transient message box for flavor text,
 *   - faded transitions between scenes,
 *   - a consistent UI layout with fullscreen support.
 *
 * Subclass it and implement {@link AdventureScene#onEnter} to build one
 * location of your adventure. Call the helper methods ({@link AdventureScene#showMessage},
 * {@link AdventureScene#gainItem}, {@link AdventureScene#gotoScene}, etc.) from
 * your interactive objects.
 *
 * @extends {Phaser.Scene}
 */
class AdventureScene extends Phaser.Scene {

    /**
     * Phaser lifecycle: receives data passed by `scene.start(key, data)`.
     * We use this to thread the inventory through scene transitions.
     *
     * @param {{inventory?: string[]}} data
     */
    init(data) {
        this.inventory = data.inventory || [];
    }

    /**
     * @param {string} key  A unique Phaser scene key (e.g. `"tunnel"`).
     * @param {string} name A human-readable name shown in the UI (e.g. `"The Tunnel"`).
     */
    constructor(key, name) {
        super(key);
        this.name = name;
    }

    /**
     * Phaser lifecycle: called once when the scene starts.
     * Lays out the UI, then invokes {@link AdventureScene#onEnter}.
     * Subclasses should override `onEnter`, not `create`.
     */
    create() {
        /** @type {number} Duration in ms of scene fade-in / fade-out. */
        this.transitionDuration = 1000;

        /** @type {number} Game width in scaled pixels (nominally 1920). */
        this.w = this.game.config.width;
        /** @type {number} Game height in scaled pixels (nominally 1080). */
        this.h = this.game.config.height;
        /** @type {number} UI spacing unit in scaled pixels (1% of width). Use multiples of `this.s` for text sizes, margins, etc. */
        this.s = this.game.config.width * 0.01;

        this.cameras.main.setBackgroundColor('#444');
        this.cameras.main.fadeIn(this.transitionDuration, 0, 0, 0);

        this.add.rectangle(this.w * 0.75, 0, this.w * 0.25, this.h).setOrigin(0, 0).setFillStyle(0);
        this.add.text(this.w * 0.75 + this.s, this.s)
            .setText(this.name)
            .setStyle({ fontSize: `${3 * this.s}px` })
            .setWordWrapWidth(this.w * 0.25 - 2 * this.s);

        this.messageBox = this.add.text(this.w * 0.75 + this.s, this.h * 0.33)
            .setStyle({ fontSize: `${2 * this.s}px`, color: '#eea' })
            .setWordWrapWidth(this.w * 0.25 - 2 * this.s);

        this.inventoryBanner = this.add.text(this.w * 0.75 + this.s, this.h * 0.66)
            .setStyle({ fontSize: `${2 * this.s}px` })
            .setText("Inventory")
            .setAlpha(0);

        this.inventoryTexts = [];
        this.updateInventory();

        this.add.text(this.w-3*this.s, this.h-3*this.s, "📺")
            .setStyle({ fontSize: `${2 * this.s}px` })
            .setInteractive({useHandCursor: true})
            .on('pointerover', () => this.showMessage('Fullscreen?'))
            .on('pointerdown', () => {
                if (this.scale.isFullscreen) {
                    this.scale.stopFullscreen();
                } else {
                    this.scale.startFullscreen();
                }
            });

        this.onEnter();

    }

    /**
     * Briefly flash a message in the UI message box. The message fades out
     * over a few seconds.
     *
     * @param {string} message The text to show.
     */
    showMessage(message) {
        this.messageBox.setText(message);
        this.tweens.add({
            targets: this.messageBox,
            alpha: { from: 1, to: 0 },
            easing: 'Quintic.in',
            duration: 4 * this.transitionDuration
        });
    }

    /**
     * Re-render the inventory panel. Called automatically by
     * {@link AdventureScene#gainItem} and {@link AdventureScene#loseItem};
     * you generally do not need to call this yourself.
     */
    updateInventory() {
        if (this.inventory.length > 0) {
            this.tweens.add({
                targets: this.inventoryBanner,
                alpha: 1,
                duration: this.transitionDuration
            });
        } else {
            this.tweens.add({
                targets: this.inventoryBanner,
                alpha: 0,
                duration: this.transitionDuration
            });
        }
        if (this.inventoryTexts) {
            this.inventoryTexts.forEach((t) => t.destroy());
        }
        this.inventoryTexts = [];
        let h = this.h * 0.66 + 3 * this.s;
        this.inventory.forEach((e, i) => {
            let text = this.add.text(this.w * 0.75 + 2 * this.s, h, e)
                .setStyle({ fontSize: `${1.5 * this.s}px` })
                .setWordWrapWidth(this.w * 0.75 + 4 * this.s);
            h += text.height + this.s;
            this.inventoryTexts.push(text);
        });
    }

    /**
     * Test whether the player is currently carrying an item.
     *
     * @param {string} item Item name.
     * @returns {boolean}
     */
    hasItem(item) {
        return this.inventory.includes(item);
    }

    /**
     * Add an item to the player's inventory (no-op with a console warning
     * if the item is already held). The inventory panel animates the new entry in.
     *
     * @param {string} item Item name. Short and consistent works best (e.g. `"key"`, not `"a shiny key"`).
     */
    gainItem(item) {
        if (this.inventory.includes(item)) {
            console.warn('gaining item already held:', item);
            return;
        }
        this.inventory.push(item);
        this.updateInventory();
        for (let text of this.inventoryTexts) {
            if (text.text == item) {
                this.tweens.add({
                    targets: text,
                    x: { from: text.x - 20, to: text.x },
                    alpha: { from: 0, to: 1 },
                    ease: 'Cubic.out',
                    duration: this.transitionDuration
                });
            }
        }
    }

    /**
     * Remove an item from the player's inventory (no-op with a console warning
     * if the item is not held). The inventory panel animates the entry out.
     *
     * @param {string} item Item name. Must match the name passed to {@link AdventureScene#gainItem}.
     */
    loseItem(item) {
        if (!this.inventory.includes(item)) {
            console.warn('losing item not held:', item);
            return;
        }
        for (let text of this.inventoryTexts) {
            if (text.text == item) {
                this.tweens.add({
                    targets: text,
                    x: { from: text.x, to: text.x + 20 },
                    alpha: { from: 1, to: 0 },
                    ease: 'Cubic.in',
                    duration: this.transitionDuration
                });
            }
        }
        this.time.delayedCall(500, () => {
            this.inventory = this.inventory.filter((e) => e != item);
            this.updateInventory();
        });
    }

    /**
     * Fade out the camera and transition to another scene by key, carrying
     * the current inventory with us.
     *
     * @param {string} key The Phaser scene key of the destination scene.
     */
    gotoScene(key) {
        this.cameras.main.fade(this.transitionDuration, 0, 0, 0);
        this.time.delayedCall(this.transitionDuration, () => {
            this.scene.start(key, { inventory: this.inventory });
        });
    }

    /**
     * Subclass hook: called at the end of {@link AdventureScene#create}, after
     * the message box and inventory panel exist. Override this in your scene
     * to add your location's interactive objects.
     *
     * @example
     * onEnter() {
     *     this.add.text(100, 100, "a rock")
     *         .setInteractive()
     *         .on('pointerover', () => this.showMessage("It's a rock."))
     *         .on('pointerdown', () => this.gotoScene('next_room'));
     * }
     */
    onEnter() {
        console.warn('This AdventureScene did not implement onEnter():', this.constructor.name);
    }

    // Extensions Below


    //Scan Planet

    scanPlanet(planet, onComplete){
        //setup
        const w = this.w, h = this.h, s = this.s;
        const cx = w * 0.375;  
        const cy = h * 0.5;
        const all = []; //adds all objects so they can be destroyed easily

         const plans = { //planet values for scanner
            xs26: {
                label: 'XS-26',
                col: 0x33dd55, textCol: '#33dd55',
                lines: [
                    'AIR QUALITY ......... CRITICAL',
                    'TOXIC COMPOUNDS ..... DETECTED',
                    'OXYGEN LEVEL ........ 0.02%',
                    'SURFACE TEMP ........ +42C',
                    'HABITABILITY ........ NONE',
                ]
            },
            r40: {
                label: 'R-40',
                col: 0xee6633, textCol: '#ee6633',
                lines: [
                    'AIR QUALITY ......... ALARMING',
                    'TOXIC COMPOUNDS ..... LOW',
                    'OXYGEN LEVEL ........ 0.08%',
                    'SURFACE TEMP ........ +54C',
                    'HABITABILITY ........ NONE',
                ]
            },
            belabog: {
                label: 'BELABOG',
                col: 0x66aaff, textCol: '#66aaff',
                lines: [
                    'AIR QUALITY ......... SERVICABLE',
                    'TOXIC COMPOUNDS ..... NOT-DETECTED',
                    'OXYGEN LEVEL ........ 0.6%',
                    'SURFACE TEMP ........ +3C',
                    'HABITABILITY ........ LOW',
                ]
            }
        };
        const plan = plans[planet];

        //background
        const panel = this.add.rectangle(cx, cy, w * 0.56, h * 0.82, 0x000d18);
        all.push(panel);
        //label
        const header = this.add.text(cx, h * 0.13, `🔬  SCANNING: ${plan.label}`, {
            fontSize: `${3 * s}px`, color: plan.textCol, fontStyle: 'bold'
        }).setOrigin(0.5);
        all.push(header);
        //make each line fade in
        let ry = h * 0.36;
            plan.lines.forEach((line, i) => {
            const lt = this.add.text(cx - w * 0.22, ry, line, {
                fontSize: '30px', color: plan.textCol
                }).setAlpha(0);
                all.push(lt);
                this.tweens.add({ targets: lt, alpha: 1, duration: 350, delay: i * 220 });
                ry += 3.8 * s;
            });
            //button to close scanner
        const closeBtn = this.add.text(cx, h * 0.86, '[ CLOSE SCANNER ]', {
                    fontSize: '35px', color: '#ffffff'
                }).setOrigin(0.5).setInteractive()
                .on('pointerout',  () => closeBtn.setStyle({ color: '#ffffff' }))
                .on('pointerdown', () => {
                    all.forEach(e => {{ e.destroy(); }});
                    closeBtn.destroy();
                    if (onComplete) onComplete();
                });
    }
    //Sample Collection
    collectSample(hexColor, item, onComplete) {
        const w = this.w, h = this.h, s = this.s;
        const cx = w * 0.375;
        const cy = h * 0.5;
        const all = []; //adds all objects so they can be destroyed easily

        //background UI
        const overlay = this.add.rectangle(cx, cy, w * 0.75, h, 0x000000, 0.78)
            .setInteractive();
        all.push(overlay);

        //Label
        const label = this.add.text(cx, h * 0.1, '🧪  Collecting...', {
            fontSize: `${2.6 * s}px`, color: '#ffffff'
        }).setOrigin(0.5);
        all.push(label);


        //Values for placement of vial for sample, so they can be referenced without needing to be recalculated.
        const vW  = 11 * s;
        const vH  = 30 * s;
        const vX  = cx;
        const vY  = cy + 2 * s;
        const vBottom = vY + vH * 0.5;

        //v rect parts
        const vBody = this.add.rectangle(vX, vY, vW, vH, 0xffffff, 0.08)
            .setStrokeStyle(s * 0.28, 0xdddddd);
        all.push(vBody);

        const vNeck = this.add.rectangle(vX, vY - vH * 0.5 - 2.5 * s, vW * 0.5, 5 * s, 0xaaaaaa, 0.15)
            .setStrokeStyle(s * 0.2, 0xaaaaaa);
        all.push(vNeck);
        //v fill object
        const liquid = this.add.rectangle(vX, vBottom, vW - s * 0.8, 0, hexColor, 0.92)
            .setOrigin(0.5, 1);
        all.push(liquid);
        //fill v tween
        this.tweens.add({
            targets: liquid,
            height: vH * -0.86,
            duration: 2200,
            ease: 'Cubic.inOut',
            onComplete: () => {
                label.setText('✅ Sample Collected!');
                label.setStyle({ color: '#00ff99' });

                this.gainItem(item);

                this.time.delayedCall(1300, () => {
                    all.forEach(e => { e.destroy(); });
                    if (onComplete) onComplete();
                });
            }
        });
    }
}

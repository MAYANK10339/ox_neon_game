/**
 * OX ULTIMATE - Economy & Badges Engine
 * Manages player Coins, Secret Code Redemption ("xerpro"),
 * and VIP / Premium / Red Xer Fired Verification Badges.
 */

class EconomyEngine {
  constructor() {
    this.STORAGE_COINS = 'ox_ultimate_coins';
    this.STORAGE_INVENTORY = 'ox_ultimate_inventory';
    this.STORAGE_EQUIPPED = 'ox_ultimate_equipped_badge';

    this.BADGES = {
      premium: {
        id: 'premium',
        name: 'Premium',
        cost: 4000,
        desc: 'Glowing amber-gold tag on player scoreboard and chat.',
        render: () => `<span class="player-tag tag-premium">PREMIUM</span>`
      },
      vip: {
        id: 'vip',
        name: 'VIP',
        cost: 10000,
        desc: 'Royal violet-purple neon aura across all game modes.',
        render: () => `<span class="player-tag tag-vip">VIP</span>`
      },
      xer_verified: {
        id: 'xer_verified',
        name: 'Red Xer Fired Verified Tick',
        cost: 100000,
        desc: 'Official Meta-style Red Verified Rosette Tick. Ultimate status.',
        render: () => `<span class="player-tag tag-xer-verified" title="Red Xer Fired Verified"><svg class="xer-verified-tick" viewBox="0 0 24 24"><path fill="#ff003b" d="m8.6 22.5-1.9-3.2-3.6-.8.4-3.7-2.5-2.8 2.5-2.8-.4-3.7 3.6-.8 1.9-3.2 3.4 1.5 3.4-1.5 1.9 3.2 3.6.8-.4 3.7 2.5 2.8-2.5 2.8.4 3.7-3.6.8-1.9 3.2-3.4-1.5zm2.15-7.1 5.9-5.9-1.4-1.4-4.5 4.5-2.1-2.1-1.4 1.4z"/></svg><span class="xer-verified-text">Xer Verified</span></span>`
      }
    };

    this.coins = this.loadCoins();
    this.inventory = this.loadInventory();
    this.equippedBadge = this.loadEquipped();
  }

  loadCoins() {
    try {
      const v = localStorage.getItem(this.STORAGE_COINS);
      return v !== null ? Math.max(0, parseInt(v, 10) || 0) : 0;
    } catch (e) {
      return 0;
    }
  }

  saveCoins() {
    try {
      localStorage.setItem(this.STORAGE_COINS, String(this.coins));
    } catch (e) {}
  }

  loadInventory() {
    try {
      const data = localStorage.getItem(this.STORAGE_INVENTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveInventory() {
    try {
      localStorage.setItem(this.STORAGE_INVENTORY, JSON.stringify(this.inventory));
    } catch (e) {}
  }

  loadEquipped() {
    try {
      return localStorage.getItem(this.STORAGE_EQUIPPED) || null;
    } catch (e) {
      return null;
    }
  }

  saveEquipped() {
    try {
      if (this.equippedBadge) {
        localStorage.setItem(this.STORAGE_EQUIPPED, this.equippedBadge);
      } else {
        localStorage.removeItem(this.STORAGE_EQUIPPED);
      }
    } catch (e) {}
  }

  getCoins() {
    return this.coins;
  }

  addCoins(amount, silent = false) {
    if (amount <= 0) return this.coins;
    this.coins += amount;
    this.saveCoins();
    if (!silent && window.sound) {
      window.sound.playCoinReward();
    }
    this.notify();
    return this.coins;
  }

  spendCoins(amount) {
    if (this.coins < amount) return false;
    this.coins -= amount;
    this.saveCoins();
    this.notify();
    return true;
  }

  hasBadge(id) {
    return this.inventory.includes(id);
  }

  getEquippedBadge() {
    return this.equippedBadge;
  }

  buyBadge(id) {
    const badge = this.BADGES[id];
    if (!badge) return { success: false, message: 'Invalid item.' };
    if (this.hasBadge(id)) return { success: false, message: 'Already unlocked!' };

    if (this.coins < badge.cost) {
      const diff = badge.cost - this.coins;
      return { 
        success: false, 
        message: `Need ${diff.toLocaleString()} more coins! Play or use code "xerpro".` 
      };
    }

    this.spendCoins(badge.cost);
    this.inventory.push(id);
    this.saveInventory();

    // Auto-equip on purchase
    this.equippedBadge = id;
    this.saveEquipped();

    if (window.sound) {
      window.sound.playWin();
      window.sound.vibrate([40, 30, 80]);
    }

    this.notify();
    return { success: true, message: `Successfully unlocked & equipped ${badge.name}!` };
  }

  equipBadge(id) {
    if (id && !this.hasBadge(id)) {
      return { success: false, message: 'Badge not unlocked yet.' };
    }

    if (this.equippedBadge === id) {
      // Toggle unequip
      this.equippedBadge = null;
    } else {
      this.equippedBadge = id;
    }

    this.saveEquipped();
    if (window.sound) window.sound.playClick();
    this.notify();
    return { 
      success: true, 
      equipped: this.equippedBadge === id,
      message: this.equippedBadge ? `Equipped ${this.BADGES[id].name}` : 'Unequipped badge.' 
    };
  }

  redeemSecretCode(rawCode) {
    const clean = (rawCode || '').trim().toLowerCase();
    if (clean === 'xerpro') {
      const reward = 10000;
      this.addCoins(reward);
      if (typeof confetti === 'function') {
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#fbbf24', '#ff0844', '#a855f7']
          });
        } catch (e) {}
      }
      return {
        success: true,
        amount: reward,
        message: `+10,000 Coins added! Secret Code "xerpro" redeemed successfully!`
      };
    }

    return {
      success: false,
      amount: 0,
      message: 'Invalid secret code! Hint: Use code "xerpro" for +10,000 coins.'
    };
  }

  renderBadgeHtml(id) {
    if (!id || !this.BADGES[id]) return '';
    return this.BADGES[id].render();
  }

  notify() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ox_economy_updated', {
        detail: {
          coins: this.coins,
          inventory: [...this.inventory],
          equippedBadge: this.equippedBadge
        }
      }));
    }
  }
}

// Global instance
window.economy = new EconomyEngine();

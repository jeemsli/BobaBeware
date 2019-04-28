var x2 = this.bot.currentPath[0].x;
var y2 = this.bot.currentPath[0].y;

var x = this.bot.spritePosition.x;
var y = this.bot.spritePosition.y;

var bodyX = this.bot.sprite.body.x + 32;
var bodyY = this.bot.sprite.body.y + 64;

if(x2 < x && y2 < y) {
  //TOP LEFT
  if((bodyY / 32) < y2 && (bodyX / 32) < x2) {
    var node = this.bot.currentPath.shift();
    this.bot.sprite.body.velocity.y = 0;
    this.bot.sprite.body.velocity.x = 0;
    this.bot.spritePosition = {x: node.x, y: node.y, tile: node.tile};
    this.bot.sprite.body.y = (y2 - 64) * 32;
    this.bot.sprite.body.x = (x2 - 32) * 32;
    this.bot.sprite.animations.stop();
    this.bot.counter = true;
  } else {
    this.bot.sprite.body.velocity.y = -(this.bot.speed);
    this.bot.sprite.body.velocity.x = -(this.bot.speed);
    if(this.bot.counter) {
      this.bot.counter = false;
      this.bot.sprite.animations.play('topleft');
    }
  }
} else if (x2 == x && y2 < y) {
  //TOP
  if((bodyY / 32) < y2) {
    var node = this.bot.currentPath.shift();
    this.bot.sprite.body.velocity.y = 0;
    this.bot.spritePosition = {x: node.x, y: node.y, tile: node.tile};
    this.bot.sprite.body.y = (y2 - 64) * 32;
    this.bot.counter = true;
    this.bot.sprite.animations.stop();
  } else {
    this.bot.sprite.body.velocity.y = -(this.bot.speed);
    if(this.bot.counter) {
      this.bot.counter = false;
      this.bot.sprite.animations.play('top');
    }
  }
} else if (x2 > x && y2 < y) {
  //TOP RIGHT
  if((bodyY / 32) < y2 && (bodyX / 32) > x2) {
    var node = this.bot.currentPath.shift();
    this.bot.sprite.body.velocity.y = 0;
    this.bot.sprite.body.velocity.x = 0;
    this.bot.spritePosition = {x: node.x, y: node.y, tile: node.tile};
    this.bot.sprite.body.y = (y2 - 64) * 32;
    this.bot.sprite.body.x = (x2 - 32) * 32;
    this.bot.counter = true;
    this.bot.sprite.animations.stop();
  } else {
    this.bot.sprite.body.velocity.y = -(this.bot.speed);
    this.bot.sprite.body.velocity.x = (this.bot.speed);
    if(this.bot.counter) {
      this.bot.counter = false;
      this.bot.sprite.animations.play('topright');
    }
  }
} else if (x2 < x && y2 == y) {
  // LEFT
  if((bodyX / 32) < x2) {
    var node = this.bot.currentPath.shift();
    this.bot.sprite.body.velocity.x = 0;
    this.bot.spritePosition = {x: node.x, y: node.y, tile: node.tile};
    this.bot.sprite.body.x = (x2 - 32) * 32;
    this.bot.sprite.animations.stop();
    this.bot.counter = true;
  } else {
    this.bot.sprite.body.velocity.x = -(this.bot.speed);
    if(this.bot.counter) {
      this.bot.counter = false;
      this.bot.sprite.animations.play('left');
    }
  }
} else if (x2 > x && y2 == y) {
  // RIGHT
  if((bodyX / 32) > x2) {
    var node = this.bot.currentPath.shift();
    this.bot.sprite.body.velocity.x = 0;
    this.bot.spritePosition = {x: node.x, y: node.y, tile: node.tile};
    this.bot.sprite.body.x = (x2 - 32) * 32;
    this.bot.sprite.animations.stop();
    this.bot.counter = true;
  } else {
    this.bot.sprite.body.velocity.x = (this.bot.speed);
    if(this.bot.counter) {
      this.bot.counter = false;
      this.bot.sprite.animations.play('right');
    }
  }
} else if (x2 < x && y2 > y) {
  // BOTTOM LEFT
  if((bodyY / 32) > y2 && (bodyX / 32) < x2) {
    var node = this.bot.currentPath.shift();
    this.bot.sprite.body.velocity.y = 0;
    this.bot.sprite.body.velocity.x = 0;
    this.bot.spritePosition = {x: node.x, y: node.y, tile: node.tile};
    this.bot.sprite.body.y = (y2 - 64) * 32;
    this.bot.sprite.body.x = (x2 - 32) * 32;
    this.bot.sprite.animations.stop();
    this.bot.counter = true;
  } else {
    this.bot.sprite.body.velocity.y = (this.bot.speed);
    this.bot.sprite.body.velocity.x = -(this.bot.speed);
    if(this.bot.counter) {
      this.bot.counter = false;
      this.bot.sprite.animations.play('bottomleft');
    }
  }
} else if (x2 == x && y2 > y) {
  // BOTTOM
  if((bodyY / 32) > y2) {
    var node = this.bot.currentPath.shift();
    this.bot.sprite.body.velocity.y = 0;
    this.bot.spritePosition = {x: node.x, y: node.y, tile: node.tile};
    this.bot.sprite.body.y = (y2 - 64) * 32;
    this.bot.sprite.animations.stop();
    this.bot.counter = true;
  } else {
    this.bot.sprite.body.velocity.y = (this.bot.speed);
    if(this.bot.counter) {
      this.bot.counter = false;
      this.bot.sprite.animations.play('bottom');
    }
  }
} else {
  // BOTTOM RIGHT
  if((bodyY / 32) > y2 && (bodyX / 32) > x2) {
    var node = this.bot.currentPath.shift();
    this.bot.sprite.body.velocity.y = 0;
    this.bot.sprite.body.velocity.x = 0;
    this.bot.spritePosition = {x: node.x, y: node.y, tile: node.tile};
    this.bot.sprite.body.y = (y2 - 64) * 32;
    this.bot.sprite.body.x = (x2 - 32) * 32;
    this.bot.sprite.animations.stop();
    this.bot.counter = true;
  } else {
    this.bot.sprite.body.velocity.y = (this.bot.speed);
    this.bot.sprite.body.velocity.x = (this.bot.speed);
    if(this.bot.counter) {
      this.bot.counter = false;
      this.bot.sprite.animations.play('bottomright');
    }
  }
}
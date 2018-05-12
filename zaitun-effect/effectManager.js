"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var Effect = /** @class */ (function (_super) {
    __extends(Effect, _super);
    function Effect() {
        return _super.call(this, { type: 'initZaitun' }) || this;
    }
    Effect.prototype.dispatch = function (action) {
        this.next(action);
    };
    Effect.prototype.whenAction = function () {
        var types = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            types[_i] = arguments[_i];
        }
        return this.pipe(operators_1.filter((function (action) { return Boolean(types.find(function (type) { return type === action.type; })); })));
    };
    return Effect;
}(rxjs_1.BehaviorSubject));
exports.Effect = Effect;
var EffectSubscription = /** @class */ (function (_super) {
    __extends(EffectSubscription, _super);
    function EffectSubscription(effect) {
        var _this = _super.call(this) || this;
        _this.effect$ = effect;
        return _this;
    }
    EffectSubscription.prototype.addEffect = function (streamCallback) {
        var _this = this;
        var effectStream = streamCallback(this.effect$);
        this.add(effectStream.subscribe(function (ac) {
            if (typeof ac.dispatch === 'function') {
                ac.dispatch(ac);
                _this.effect$.dispatch(ac);
            }
        }));
        return this;
    };
    EffectSubscription.prototype.dispose = function () {
        if (!this.closed) {
            this.unsubscribe();
        }
    };
    return EffectSubscription;
}(rxjs_1.Subscription));
exports.EffectSubscription = EffectSubscription;
var EffectManager = /** @class */ (function () {
    function EffectManager() {
    }
    EffectManager.prototype.effect = function () {
        return new Effect();
    };
    EffectManager.prototype.subscription = function (effect) {
        return new EffectSubscription(effect);
    };
    return EffectManager;
}());
exports.EffectManager = EffectManager;
//# sourceMappingURL=effectManager.js.map
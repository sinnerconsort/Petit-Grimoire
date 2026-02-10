/**
 * Petit Grimoire — Sprite Registry
 * Maps familiar forms → animation data with embedded base64 sprites.
 * Each animation: { src, frames, speed (ms per frame) }
 *
 * Sprites are embedded as data URIs to avoid path resolution issues.
 * All sprites are 52×52 pixels per frame, arranged horizontally.
 */

// ============================================
// EMBEDDED SPRITE DATA (base64 data URIs)
// ============================================

const IdleCatb = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOAAAAAgCAYAAAALxXRRAAAAXNSR0IArs4c6QAAA8tJREFUeJztmj1u20AQhd+QgQG1bHIBwaoNpPcN0rh0J+QSadPkFmkCIlUa3yBAygCpZegCaQwXLgwb1qSwliYp/uxydzmkNA8w9OPlfsPRzONqKUClUh2nkiThJEn4VPkqlYhM4UsVvzS/HMcp81X9otATZlnGAHB/f4/dbhd8/qnzgcPCHzsOaX45Dim2pMr5H/X8syzjNE05TVM2jTCmpPkmhizLiqvv2Fchab5hSq5CJNnl/I8eQ5qmTEQMwDyOKmm+tAFI800MUzGgsRugKf+j8fdAJqLixMcsAmk+IG8A0nxpAxBtAAjmP1+DF4tFBW6e52tED0SaD8gbgDQfkDcASb5k/jkBcb4G//mMg0fET4Y0X9wApPmAvAFI8n3y37dDw01jfE/s7u7Oa2dIml8TJyB8XzNW74HNP1QeP3wFiAjMHGs3TJqPfA3+9GOBx8dHMDOIXlHMjHwNXH8Lv9s+Ib5X/rsC49X5Epvb7cG4s7Mzfn5+BvNrH5gTJiIQEV5eXgy0be5BjR+Z38ksS9oApPk1hTIA6/xH4lvHEjL/gxqwOJiIjeOUXacySdWRbJLQy43At2YCoxjQpPkRDMAp/5ENqDeWkPl/NyD+t0iZsTpfWo3dn1BQSfGfnp4IeDOA/XMAwG63q3wgAwxo8vyHhwd4FuCs+SHz39aAbFHYNmNiKjh/73zWSyE1oLAGYJt/aQMyCpH/pgYsCtt2SVBWfrXF9c9l43suxT1UA/m0ud3y6nzp0oQxDMglP9L8kAYwJP/SBhgk/0nbP4Y0H/D65dfmvVjy4FOIDym/Opwjv9qaQulaE7HFmCnxQxuAa/6lV2CNcs1/awPaaHO7Lf6Mvvx+S8rNxeXBeyEVi+/TCAMNoCgm3yaU5nsYQCGfGELwfeSa/9YGtAiYzLg2J/r491fH4d0S4ju5cCADqC/5rYtFmt8Yk98KyHsVMuYKLET+G++HlQu6KyGl7dridVewLbzJ8i2OcVoGtcxX3/aeC7/SoE1x3FxcVkzQ8jOYC78y1kZN8/U2oO3EgYp/cvyRDKC86TAbfh/TMYYilrnwQ+S/88a0i/p2uZwmk+VPygCmzo+9Apo638w9lB2sATvgg35eNDf+ERmQMz+wAcyOX2K0qZXdub4F3C7xdQ29lTEB/uwMQJp/ygbUpb78R73Z7NmA0vxTNiDlj8T3ug945Ir6ix3lKx+I2IABrn6z5qtUNtIrYCRJG4Dy58HXBlSpBGXdgPWf3PS9Di3lK/8Y+VY3JmvjbV+HuvwrX/mnzFepVCqV6gj1H2RoApaEprMaAAAAAElFTkSuQmCC';
const Idle2Catb = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAcAAAAAgCAYAAACFFqhFAAAAAXNSR0IArs4c6QAABXpJREFUeJztnb1O7FYUhdfxREi00+QFENRXShnpvkEaytuN8hJpUqTJW6SJRqnS3De4UspIqUG8wG0QBQUCMSfF5Qy28bGPz4+XjdeSEIzl8be9vdfetvEAIEmSlElVVVl2DJIUqoodgCRJZVRVlWUMJOYQ1ACWxsiU2Gi9CA+HQxHGnPlzUVVVds37z5arw6mPAbv+WfvNZs85ljUqJP/ZD8x2u7UAcHd3d1w2ZQGw+cB8GhAzBhcH0/wsPvP41+ufse9sPsAfPGz/t+Ng52E1/Xe73drNZmM3m411RpjylgSb72LYbrfW3X5i8gHOLaH6vq+N387/1Ox2/a+J72Jg5X8OfKBZ/2vjU/O/2WysMcYCcN9XxWcP4Dk2IPYAWlP+2fXP5rPzz+a7GNZ6AkDN/wvQGmOO03/KINh8gN8A2Hx2A2Dzmfln1z+bD/Drn81n1z+bT8v/fgd7enragLuf9zsUD4TNB/gNgM0H+A1grQOIXf9sPsCvfzYfkP9Ayr+tYOx+B/vvL3jzHeWTwebTGwCbD/AbwIoHELv+2Xx2/ul8QP6Lzf/QEzK2a53UHbu9vU16MofNb8lWMPhzZ3HxPXD1FY3vP/wOGGNgrS31NBKbj/0O9ue/TvHw8ABrLYz5hrLWYr8DPv1R5uM2M+GXzL/8Nyx2/bP57Ppn85Py3xeYvTg/w9X1zZv1Tk5O7NPTE6z95gO3w8YYGGPw/PzsoL5tRw3ewvxeZl3sBsDmt5SrAQTnvxA/OJaJ8i//ecSufza/JflvpOr5jxqAxzcbY93Er0/9xkaaZwRJxi/ID2YCkzSgWfMLNIBR+S/cgAZjmSj/8p9H7Ppn8+W/fPn/LiL+10itxcX5WdC6LzuUVSz+4+OjAV4bwMvPAIDD4dA4IBENaPb8+/t7JBbgovns/DvJf/JfnS3/jc+/bwDagMIOWaeksvNfzjyCbwWoAeVtAKH5Zzcgp4L5l/9CApD/5L/E/HcNwGNhh14S17W/vMGnv886l40p7lhF8s3V9Y29OD8bY8ISDWhMftj8nA0gJv/sBlhqACX5z6exwyW3Bvjy33i+/Jch/97/BhFrvquvYctKKYFvchyk/eXbbewvb1yh9N0TsAHrzImfuwGMzT/7CqhTCflvKNZ/v/74lt+1rJQS+Fn859NU/puQL/+NkC+3Sf8O6er65vjl9Ns/r0n5/OHjm2U5VYqfYoTIAXwsplQTsvk5BkBKDLkGUKymPAGU//wxDS1rKZ//yHyfpvLflNvs0tgTMO8ADAjYuPV8ZwI//fel5+39IvFHnQVlagDtW17BxcLmd8aUNgCSrwLeywCS/4bVlf96PC7/fTEis/+m5PfFNLTMo3T/pfGjWCn+67rF0ri07Qu89rjq8XVfsB7ebPkB7xl1G8CzvfZjv0vhNwzaFcfnDx8bTTDwGCyF31g3RGP5tfd0Sv6T/5zkv2F1bW9wAIZuOFPxz44/UQOo/9J5Mfwh5sgYjrEshT/FAAqR/Pf6OjIG+a8Wy1L4OfLvPSAxJujR2F/mM/mzagBz57MHAJvvtp0x/9Ex9Ej+k/9CY1gU3207lp1tAPbAYx67Xhz/HTWg0Xz2AGDzawyfih9/n+Q/APLf2BgWxa8xfPKye++vAuMucduK2PG58BfXANj8NTegPkXmH5D/ormtGFbBZ9c/m+/TUP6Lftg00YBs/pobkPh8PiD/rfn4iz8BP+lzgO9clL+YIb74EgB+/sVfAb/YAMxw9rloviQxxa5/Nl+SQqQrwEJiNwDx181fu9j5F38ZfA1ASZIkaZUKHoBX180/OTP0OrfEF1988cUXPyc/6IOJrfVDX+e6/BVffPHFF198Bl+SJEmSJEmSJEl6F/ofRQsNyAXJyJUAAAAASUVORK5CYII=';
const RunCatb = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOAAAAAgCAYAAAALxXRRAAAAXNSR0IArs4c6QAABINJREFUeJztnE9q20AUxr+RSiCrOLPpBUy8DnSfG3TTZejGdNtLdNNbZBNMV4WSGxS679rGF8hGEAg0OESvC1uyPJZGM9LMPEnWB8KysOf3rHnz/liygVGjHCqKIjplvq0ibgNGDU/ci4CbnymKIqqzRYQyZlQ4FSc9TdPgc5zxOdhd4pvYMGbAgUlKSZPJBACPAxb5HOoSnysA5Km3K6XAqUhKSXEcUxzHJKUMfu5HPi8/N0JKSeMiNOsBXCqOYxJCEIDsMahGPi+/NAJwLEDuxc/B351vEkLk7JBReOTz8gF0IAKAPwMX+aGYizno/Pz84Nxn+4s5vNsx8pvznTWJUkpKkgRCCAixHXYymSBJkmCNqJSSnp6eAAAXFxdIkkREUUShmuEyfgAsRRC4nxNm74HlIw4eP3wHhBAgIl+2uOITmvljr/lOJmUxB335cY6XlxcQUb4AiQiLOXB7F+ZyRxzHlKZpboNHp2Plty1t2gYGD3yaXU2xXK0BA58cEv9dm4F2os93Avfzf4WVT2oEIN+LoZiBo2h7deXy8pJCZeCQ/OfnZ7y+voJo6wdZwMuqj7e3tywAuEaPfMf8RmmZOwKr4s7AHvhG5dAusB2U/eqkK/boxrQuwRzyaXY1BQDjLDQUvnZCqtLy2dkZtYwAphNt4hQ+eiAbZ3TNtymHcsepU814ViWYB/7BWBZ29J7fqATdbDYC2EeA3T4AIE3TgwVpEYFVZU5xtBjKMvDXX+WDSLkfL9upycCV3EB8UxlPvie55ovlam0z5iD4rXpAIoJlBHCiIfUArrX4tMbtz2npMV1QAYC6wOOb78KOvvGr7gU1Wd1sEXiz2QgiEpnjA9UZOHvc7Qs4+OaXm6/T8tHsmCKRBcjdnDaOHA35R3acCr/MGUxr4dIFWBMBdOM5s6FMtuzAPVgT/sEiKbPj4foGH//+trHB6rN74Oc2GLx+EPzKErRBQ759X7sIBHhYfJ7EzRd1NhQn30aGJZg3vqEdg+C3+jnScrXOt0zf/uwNeri+OTpmMzYa1uBlx9qWVqH5Bq/Ps5U6B2UyPJ82JZgP/pEK5+FoGwK/MgMaREHvEaiJHGRgAM0bcVd8jQjYlzyZE+jmoYnzaT5/EL5qS42dveVre8DCm7VwE0N99H+qLar60APo+IX3aDllr1PU+NoeA//IBhP1lV+7AE3hDiOQcQAA9Iu+oR2d4rfVcrX27nyO+U5t6Drf2RccviKwDdd1BmbiW9vgiNklPqCUukPlO/tPmNnVtHSrM6BEVtdiir1IlSwngps/aivu8xWEX3udiSkCnUwPoLMBGH4G0PFPoQrw2o/03QGY+UCL8+8o63LxXfehtrYE43f5bwlPogQZddpy8YPcUnH3PafO77nE7hqks/G6yu9yBgQa3hzr0Pm5+VpG0TaTuzF6xhcOt87yvWVAh7L6nZYH5+fm66RG6uLzEDZw83sv4wWYRTflLpHK5z5UZFTt+xQnX8NQHd2L43PzhyqjC9PK602fu56I4ri6fV8OwMUPdX67yh+0/gOicRf83uFGigAAAABJRU5ErkJggg==';
const Sittingb = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAgCAYAAADtwH1UAAAAAXNSR0IArs4c6QAAAnBJREFUaIHtWDGOnDAUfR9HI01LkwusduqV0u8N0qRMh3KSNLlFmgil3xtESp8axAXSjKYcaTTzU7AmZgCDzTdeCZ6EQB7s99/3s/0ZYMOGDRs2bNgQBSQ9YJIkrJ9vt5v4+G8drvpFE5SmKQPA6XRq2paehJgGiKo/TVNWSrFSinUgZjKWiiFNU06SpLmW5I6qXynFRMQA9H1RxE5AVP2vgpmIGufpJCyFmAmIqj/PwPv9viVeP+cZFgkiZgLm6p97QHACwo+McXgPFH/Run/4BhARmDnYQZRn4C8/9zifz2BmENVUzIw8Az5/l6/0DMzW7xzcXGcdj0fJhCxuAGn9zoHtdju+XC5gruPQjiMiEBGu16sWPTTErGTENoC0fu9giIj1kjeXvYm7LUHEhbEN0AwipH9OMHx4fJj0YlFWc7k6iGUAc3gJ/e9Ck4cCM8MxAaL0UvoTkVFG8BqsZFkY3QAusOkXm4D8U9dlfW0xEMAAHfjq956AoqyaC6hLv847PW2hsLQBpPT7TgABtbP0VvD19/8t4eXpudMmjcgGENPvWxnw4fGhdbjZ9uQQVRAs58DL0zM+/vkVMgYx/T4BtYQXZRUi+Wzpw0AtOJIBRPXbguKed3pdN1LmOSffSO593w6/sAH6NFv5DY4hWLlHiQwBzqVfUVbeK6wncYP8Qgbo09z7+1RM0d/3ITYWyFRyn25esEyMS+xUlBXrg7UoK9s2OIqp+geroLvkx/7w8XGfDw8N9Aumf3ACjI+XKMlfC7/TYeOCmZXHavinVEEA7GXenADWzm/7N7RVgTixy2AV/C4OMWvksWfXsVfL/w8lwuGYkVMODwAAAABJRU5ErkJggg==';
const Sleeping = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAgCAYAAADtwH1UAAAAAXNSR0IArs4c6QAAAmRJREFUaIHtWTuO2zAUnCcuDKRlk9LNYl0HSJ8b5ALphNxlb5EmMNLnBjlBai+2UZlGcGcDhvxS7FKQvJTFzyOZ7GoAQTBtcGaehj8LWLBgwYIRmqbhpmm4tI43jeUBFETO4le5iP435HoIlIMkBsNCrNfr7HpL8/8zKD0nl+YvitLmS/N7o6oqNldsX6XNh/D7+Bef07TWDAD7/b5vO5/PwTwhc/DQeAx3CL+0f6ugqVRorVkpxUopNkIkRoErv9GgtWbJUejKn8N/L8LWrpRiImIA5p4EpQtQ1P8184bYJM8UIQc/kKcA0v6DDmKXIrY1+HA4gIjAzP3Vti22NbI8BK01d10HAKiqCkSEFAGw8cf4l1gcuALhe83YvAd2fzC6f7yHEZbsELOtwV9/vMPxeAQzg+iJipmxrYEv35IeOKP8BwmLTVbbtpIFyR4ASf9BalarFZ9OJzA/6TCJIyIQEbqu64fjBKKKUToAkv6jhBARmyE/HPZDXEwJIiksHYC+EwH/sUJ4c3fr9MPdw6ME3wilAjDsPtb/TQ7yVGBmeBZAlF7Cf7b3Ac9iJbeFxQPggyn/b+aFTIIAiCBmChoN683dbf95mExb22uBhH+XRelqaqY6/vnhEz7//mUT7LsQOqXWpQAp+GP9z4mZnWcvUzDzO2/zU33OJUsoAMn9T4nhuQ4vOxcuvjN/ogBk829rDNpdzGzzRFNn45Ysfk7/wy9GT11q8dw9PAalzpdfIABF/JtdEFsWLkLkts3j8BPNf2WtcCp+Kf8vRoCtPWJIes/7wvw+Gor4DxHnCtG/nF8r/18TayRhZyLfFgAAAABJRU5ErkJggg==';
const HurtCatb = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOAAAAAgCAYAAAALxXRRAAAAXNSR0IArs4c6QAABOdJREFUeJztXEFr40YU/sYqAYPZmIGlh9BbSM5ret9/0EvIaW+mp/0ZvfQf9NhLMXsIe9l/UOg5PSf4VvZQCkq8CBwSpNeDPYqkWNKMNDNPjucDI0se6Ru9ee97TzPCQEBAwOvEaDSiQ+YPCGiDcHHRquNnWeaEZ6j8xX5wcSt+gO/+Dx064z+yTSqlpOl0CoBn4Ln5gY3hlfNzZOEiP7cAcFYhl1KycJuMv9XBkVLSarUCABwfHyOOY6+Dz82v+gAA9/f3yLJM+M6CVX5fvEUUnY6jD9XAu/LoB6zjH0URCSEIgNp6BTe/lJKiKKIoikgyqC83v+qDlJIt811KSeqj9n1xs9p/S0hCCFIp2GcnuPkBfgHg5ucWgGLwcZSfXexv5RlwMQet12sIIUBE+SeOYyzmcG4Ibn5g43xpmgIARqMRhBDwLUCc/ACwWq2QZRnSNMXd3Z1PanZ0tb+N2pRGEPhjTjj/Hrj5F6Xtj79CBYarOpibH4s56OdPYzw8PICIIMSGioiwmAMffncz2zwUfmDjgHEcQwiR80+nU2/P4XUZz8fzXx/7t3WOdrXpq6x9B4WbvwJuAeDmZxeAjycn9N96vfO3t+Mxfvv61SV/L/s3dYzOz05xc7t80e7o6Iienp5AtIkDZXClfmma5uVgDToFvmP+Rs4iuAWAm78CKwJwKSV1yVYq870dj/FDFOGfNC1tr5MEgHEmbPQFm/bvFID5yUKQUryi6pUuUlZEHSO08jrg1+YEvAjQoPltC8CllDSbTHCdJFqB8vHkpBd/S0Zs9QWb9v+uQ/+fe0qE87NTrbbbG7IKLv7Hx0cBPAvA9jsAIMuy0oB0EKDB8ydJgp4O2At15aYv2LR/XQCShmPrtHEJ6/xb5dMuRYMA2RWA2WQCAK2lqPrddKnB9oSMDfvvCsDcsXVLsiIWF0t8+Hy685iJc3dFR35xc7uk87NTkyB0IUAm9uHmtyYA28Cg2WSiHYQK2/atUM+CFmHF/rXrgF2CD9g8fOscc4Ue/MJGllhcvLzG4mKpHLVJsUmjzZD4rQrAVRwLkyBRz41VXH/7pnXMFUzt32sh/uZ2mX8UfvnreVC+vHv/4phNuOLvEwgdBSB35r5ByM3fQwByzCaTTq+QqUArBlz+Pcu8vJZmav/aANQwmFDt6pTwp7//bDi9GUz8RlnQkgBUS35tZ+Xm39mnHhWQaRasYvbmTWlbd8wWbNh/53pY0aGbHLIwXZvvN3W2hm+w/BrnGJVhNderTnvvC38pQHf148u79yUR1BmDYmnZtCxRzWZ15Wgx8DSXObzavzUAdS9syfkHx+9JAIqTH3vD38Zp2AcAL5/t2jKi7iSMupZJAALu7d+4MG2CloEynczh5B+UAAyd33YFUje5UodigDadp7vID8/2txaADeRdlh32jv8VCZAxv2UB6BSEloJPwZv9G+tbwKzEqKLrUsYA+PdOALj5bQqAaQACzaVqhwV4b/Z3utjcMwC5+Q9ZgNj51SSLaSAW0SHzFeHl/q3/KdMrgtM3dgJ/M3z+j0sNvPA7C0AL2W+v+QMCdBAyoCNwC8Ch8/csP3tD9/5DAAYEMEI7AKuv3LTt20bgP2z+6yQpzXS27duGq/vXWpistNfdt5X+A/8B8xdfObuKY6G7b7H85LZ/QEBAQEDAK8T/b/VHJNxLrDIAAAAASUVORK5CYII=';
const DieCatb = 'data:image/png;base64,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';
const Die2Catb = 'data:image/png;base64,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';

// ============================================
// FAMILIAR SPRITE REGISTRY
// ============================================

/**
 * Registry of all familiar forms and their animations.
 * Currently only 'cat' is supported.
 */
const FAMILIAR_SPRITES = {
    cat: {
        name: 'Nyx',
        animations: {
            neutral: {
                src: IdleCatb,
                frames: 4,
                speed: 600
            },
            bored: {
                src: Sleeping,
                frames: 2,
                speed: 1200
            },
            annoyed: {
                src: HurtCatb,
                frames: 4,
                speed: 400
            },
            amused: {
                src: Idle2Catb,
                frames: 5,
                speed: 500
            },
            delighted: {
                src: RunCatb,
                frames: 4,
                speed: 350
            }
        }
    }
};

// ============================================
// API
// ============================================

/**
 * Get animation data for a familiar + mood combo.
 * @param {string} familiar - Familiar form key (e.g., 'cat')
 * @param {string} mood - Mood string from getMoodText()
 * @returns {Object|null} { src, frames, speed }
 */
export function getSpriteAnimation(familiar, mood) {
    const data = FAMILIAR_SPRITES[familiar];
    if (!data) return null;

    const anim = data.animations[mood] || data.animations.neutral;
    if (!anim) return null;

    return anim;
}

/**
 * Check if a familiar has sprite support (vs ASCII-only).
 * @param {string} familiar - Form key
 * @returns {boolean}
 */
export function hasSpriteSupport(familiar) {
    return !!(FAMILIAR_SPRITES[familiar]?.animations?.neutral);
}

/**
 * Get all available mood states for a familiar.
 * @param {string} familiar - Form key
 * @returns {string[]}
 */
export function getAvailableMoods(familiar) {
    const data = FAMILIAR_SPRITES[familiar];
    if (!data) return ['neutral'];
    return Object.keys(data.animations);
}

/**
 * Get mood text from disposition value
 * @param {number} disposition - 0-100 value
 * @returns {string} Mood name
 */
export function getMoodText(disposition) {
    if (disposition < 20) return 'annoyed';
    if (disposition < 35) return 'bored';
    if (disposition < 60) return 'neutral';
    if (disposition < 80) return 'amused';
    return 'delighted';
}

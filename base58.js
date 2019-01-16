var shuffleMachine = { // https://codereview.stackexchange.com/questions/149894/making-a-semi-random-order-of-an-array-based-on-a-string 

    // creates a random number generator function.
    createRandomGenerator : function (seed) {
         const a = 6345347224;  // some big numbers
         const b = 1235623462; 
         const m = 8765432223;
         let x = seed;
         // returns a random value 0 <= num < 1
         return function(seed = x){  // seed is optional. If supplied sets a new seed
             x = (seed  * a + b) % m;
             return x / m;
         }
    },
    
    // function creates a 32bit hash of a string    
    stringTo32BitHash: function (str){
         let v = 0;
         for(let i = 0; i < str.length; i += 1){
            v += str.charCodeAt(i) << (i % 24);
         }
         return v % 0xFFFFFFFF;
    },
    
    // shuffle array using the str as a key.
    shuffleString : function (str, stringToShuffle){
        let rArr = [];
        let arr = stringToShuffle.split('');
        let random = this.createRandomGenerator(this.stringTo32BitHash(str));        
        while(arr.length > 1){
            rArr.push(arr.splice(Math.floor(random() * arr.length), 1)[0]);
        }
        rArr.push(arr[0]);
        return rArr.join('');
    }
}


var base58 = {
    alphabet: "0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz",
    bigRadix: new BigInteger("58"),
    
    shuffleAlphabet: function(str) {
        if (str != null && str != "")
        {
            this.alphabet = shuffleMachine.shuffleString(str, this.alphabet);
        }
    },

    byte_array: function (s) {
        var arr = [];
        for (var i = 0; i < s.length; i++) {
            arr.push(s.charCodeAt(i));
        }
        return arr;
    },
    string: function (arr) {
        var s = '';
        for (var i = 0; i < arr.length; i++) {
            s += String.fromCharCode(arr[i]);
        }
        return s;
    },

    // take byte array as input, give string as output
    encode: function (plain) {
        // create a copy with an extra leading 0 byte so that BigInteger
        // doesn't treat "plain" as a two's-complement value
        var plain_with_leading_zero = plain.slice();
        plain_with_leading_zero.unshift(0);
        var x = new BigInteger(plain_with_leading_zero, 256);

        var answer = '';

        while (x.compareTo(BigInteger.ZERO) > 0) {
            var mod = new BigInteger();
            x.divRemTo(base58.bigRadix, x, mod);
            answer = base58.alphabet.charAt(Number(mod.toString())) + answer;
        }

        for (var i = 0; i < plain.length; i++) {
            if (plain[i] != 0)
                break;
            answer = base58.alphabet.charAt(0) + answer;
        }

        return answer;
    },
    // take string as input, give byte array as output
    decode: function (encoded) {
        if (encoded == '')
            return '';

        var answer = new BigInteger("0");
        var j = new BigInteger("1");

        for (var i = encoded.length - 1; i >= 0; i--) {
            var tmp = base58.alphabet.indexOf(encoded.charAt(i));
            if (tmp == -1) {
                // TODO: throw error?
                return undefined;
            }
            var idx = new BigInteger("" + tmp);
            var tmp1 = new BigInteger(j.toString());
            tmp1.dMultiply(idx);
            answer = answer.add(tmp1);
            j.dMultiply(base58.bigRadix);
        }

        var ans = answer.toByteArray();
        while (ans[0] == 0)
            ans.shift();

        for (var i = 0; i < encoded.length; i++) {
            if (encoded.charAt(i) != base58.alphabet[0]) {
                break;
            }
            ans.unshift(0);
        }

        return ans;
    },
};

function from_decimal(s) {
    var r = [];
    if (s.length % 2 != 0)
        s = '0' + s;

    for (var i = 0; i < s.length; i += 2)
        r.push(parseInt(s.substr(i, 2), 10));
    return r;
}

function to_decimal(s) {
    var r = '';
    for (var i = 0; i < s.length; i++) {
        var v;
        if (s[i] < 0)
            s[i] += 256;
        v = s[i].toString(10);
        if (v.length == 1)
            v = '0' + v;
        r += v;
    }
    return r;
}

document.addEventListener('DOMContentLoaded', function () {
    let decBtn = document.getElementById("dec");
    let encBtn = document.getElementById("enc");
    let textBox = document.getElementById("text");
    let encodedBox = document.getElementById("encoded");

    encBtn.onclick = function () {
        var textToEncode = from_decimal(textBox.value);
        encodedBox.value = base58.encode(textToEncode);
    };

    decBtn.onclick = function () {
        var textToDecode = base58.decode(encodedBox.value);
        textBox.value = to_decimal(textToDecode);
    };
    
    base58.shuffleAlphabet(prompt("Please enter your codeword, leave empty or cancel for default:", ""));
});
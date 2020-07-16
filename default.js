/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
var Base64 = {
	// private property
	_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	// public method for encoding
	encode: function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
		input = Base64._utf8_encode(input);
		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
		}
		return output;
	},
	// public method for decoding
	decode: function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		while (i < input.length) {
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
		}
		output = Base64._utf8_decode(output);
		return output;
	},
	// private method for UTF-8 encoding
	_utf8_encode: function (string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	},
	// private method for UTF-8 decoding
	_utf8_decode: function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
		while (i < utftext.length) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if ((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i + 1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}
}

//테이블의 세로병합 - TableRowspan(tableId, '0');
function TableRowspan(oTable, checkColIndexs, startRowIdx, endRowIdx) {
	var delObjs = Array();
	var startIndex = startRowIdx ? startRowIdx * 1 : 0;
	var endIndex = endRowIdx ? endRowIdx : oTable.rows.length;

	for (var i = 0; i < checkColIndexs.length; i++) {
		var checkColIndex = checkColIndexs[i] * 1; //비교할 Cell Index
		var checkCell = null; //비교할 셀 오브젝트
		var CntRowSpan = 1; // 병합할 행의 수(기본값:1)
		for (var n = startIndex; n < endIndex; n++) {
			var oCell = oTable.rows[n].cells[checkColIndex];

			if (oCell != undefined) {
				var tValue = oCell.innerHTML; //현재 값 할당
				var checkValue = checkCell ? checkCell.innerHTML : null; //비교기준 값 할당(기본값 null)

				//비교기준 Cell의 값과 현재 Cell의 값을 비교
				if (checkValue != tValue) {
					if (checkCell && cntRowSpan > 1) {
						checkCell.rowSpan = cntRowSpan;	// 병합값 설정
					}
					checkCell = oCell; //비교기준 cell할당
					cntRowSpan = 1;    //병합값 초기화
				}
				else {
					delObjs[delObjs.length] = oCell; //삭제할 Object추가
					cntRowSpan++;	//병합값을 1증가 시킨다.
				}
			}
		}
		//마지막 병합값 설정은 for문에서 처리되지 않기때문에 한번더 실행한다.
		if (checkCell) {
			checkCell.rowSpan = cntRowSpan;
		}
	}

	//오브젝트 삭제
	for (var i = 0; i < delObjs.length; i++) {
		delObjs[i].parentNode.removeChild(delObjs[i]);
	}
}
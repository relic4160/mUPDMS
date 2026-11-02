var UpdmsConfig = {
	//암호화
	Crypto: (function () {
		return {
			KEY: 'updms4', //★변경주의!! 변경전 암호화된 값을 복호화 할 수 없음
		};
	})(),
};

var CryptoUtil = {
	//Hex 문자열을 Uint8Array로 변환
	HexToUint8Array: function (data) {
		if (data.length % 2 !== 0) throw new Error("Invalid hex string");

		const array = new Uint8Array(data.length / 2);
		for (let i = 0; i < array.length; i++) {
			array[i] = parseInt(data.substr(i * 2, 2), 16);
		}
		return array;

	},
	//바이트 배열을 URL/HTML에 안전한 Base64로 변환 (+, /, = 제거)
	Uint8ArrayToUrlSafeBase64: function (uint8Array) {
		let binary = '';
		const len = uint8Array.byteLength;

		for (let i = 0; i < len; i++) {
			binary += String.fromCharCode(uint8Array[i]);
		}

		//+,/를 -,_로 바꾸고 패딩(=) 제거
		return btoa(binary)
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');

	},
	//URL/HTML에 안전한 Base64를 바이트 배열로 변환 (-, _를 +, /로 복원하고 패딩(=) 추가)
	UrlSafeBase64ToUint8Array: function (base64String) {
		//변경된 특수문자(-, _)를 원래 Base64(+, /)로 복원
		let cleanedBase64 = base64String.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/');

		//제거했던 패딩(=)문자를 크기계산 후 복원
		const pad = cleanedBase64.length % 4;
		if (pad === 2) cleanedBase64 += '==';
		else if (pad === 3) cleanedBase64 += '=';

		const binaryString = atob(cleanedBase64);
		const len = binaryString.length;
		const bytes = new Uint8Array(len);

		for (let i = 0; i < len; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		return bytes;
	},
	//입력길이에 상관없이 키를 SHA-256을 통해 32바이트(256비트) 규격의 키 배열로 변환
	StretchKey: async function (shortKey) {
		const keyData = new TextEncoder().encode(shortKey);
		const hashBuffer = await window.crypto.subtle.digest("SHA-256", keyData);

		return new Uint8Array(hashBuffer);
	},
	//고정키 가져오기
	ImportFixedKey: async function (shortKey) {
		const expandedKeyBuffer = await CryptoUtil.StretchKey(shortKey);

		return window.crypto.subtle.importKey(
			"raw",
			expandedKeyBuffer,
			{ name: "AES-GCM" },
			false,
			["encrypt", "decrypt"]
		);
	},
	//암호화
	//const a = await CryptoUtil.EncryptWithFixedKey(auth_key, UpdmsConfig.Crypto.KEY);
	EncryptWithFixedKey: async function (text, hexKey = UpdmsConfig.Crypto.KEY) {
		const encoder = new TextEncoder();

		try {
			const key = await CryptoUtil.ImportFixedKey(hexKey);
			const iv = window.crypto.getRandomValues(new Uint8Array(12));
			const encodedText = encoder.encode(text);

			const encryptedBuffer = await window.crypto.subtle.encrypt(
				{
					name: "AES-GCM",
					iv: iv,
				},
				key,
				encodedText
			);

			const combinedBuffer = new Uint8Array(iv.length + encryptedBuffer.byteLength);
			combinedBuffer.set(iv, 0);
			combinedBuffer.set(new Uint8Array(encryptedBuffer), iv.length);

			return CryptoUtil.Uint8ArrayToUrlSafeBase64(combinedBuffer);
		} catch (error) {
			//console.error('error:' + error.name, error.message);
			return null;
		}
	},
	//복호화
	//const a = await CryptoUtil.DecryptWithFixedKey(encryptedValue, UpdmsConfig.Crypto.KEY);
	DecryptWithFixedKey: async function (encryptedBase64, hexKey = UpdmsConfig.Crypto.KEY) {
		const decoder = new TextDecoder();

		try {
			if (!encryptedBase64 || typeof encryptedBase64 !== 'string') {
				throw new Error('The string to be decrypted is invalid.');
			}

			const key = await CryptoUtil.ImportFixedKey(hexKey);
			const combinedBuffer = CryptoUtil.UrlSafeBase64ToUint8Array(encryptedBase64);

			const iv = combinedBuffer.slice(0, 12);
			const encryptedData = combinedBuffer.slice(12);

			const decryptedBuffer = await window.crypto.subtle.decrypt(
				{
					name: "AES-GCM",
					iv: iv,
				},
				key,
				encryptedData
			);

			return decoder.decode(decryptedBuffer);
		} catch (error) {
			//console.error('error:' + error.name, error.message);
			return null;
		}
	},

};

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

			if (oCell !== undefined) {
				var tValue = oCell.innerHTML; //현재 값 할당
				var checkValue = checkCell ? checkCell.innerHTML : null; //비교기준 값 할당(기본값 null)

				//비교기준 Cell의 값과 현재 Cell의 값을 비교
				if (checkValue !== tValue) {
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
	for (var j = 0; j < delObjs.length; j++) {
		delObjs[j].parentNode.removeChild(delObjs[j]);
	}
}

function moveThisPage(url) {
	window.location.href = url;
}
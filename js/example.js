
window.onload = function() {
	var bam = new BamData("sample/ENCFF437TPA_chr22_cut.sorted.bam", {localFlg: true});
	
	var showBtn = document.getElementById("show_btn");
	showBtn.addEventListener("click", function(e) {
		var posList = getChromStartEndStrand();
		if(posList) {
			var chr = posList[0];
			var start = posList[1];
			var end = posList[2];
			var strand = posList[3];
			
			bam.readWaitReader(chr, start, end, function(fetcher) {
				var counter = 0;
				var reads = dataMagic[1];
				for(var alnEach of fetcher()) {
					reads.push({
						qname: alnEach[3], flag: alnEach[2], pos: alnEach[0], mapq: alnEach[1], 
						cigar: alnEach[4], seq: alnEach[6], posEnd: alnEach[5], id: alnEach[11], 
						cigarLn: alnEach[12], cigarOp: alnEach[13]
					});
					counter ++;
					if(counter % 100000 == 0) {
						alert("Too many read (>= 100000) and some reads truncated. " + chr + ":" + bpStart + "-" + bpEnd + " will be incomplete display.");
						break;
					}
				}
				accDefault.success(dataMagic[0]);
				accDefault.complete();
			}, function(err) {
				accDefault.error(err, err, err);
				accDefault.complete();
			});
		}
	});
};

function getChromStartEndStrand() {
		var bamRegion = document.getElementById("bam_region");
		var bamRegionValue = bamRegion.value;
		var chrPos = bamRegionValue.replace(" ", "").split(":");
		if(chrPos.length <= 1) {
			alert("Please input genomic region.");
			bamRegion.focus();
			return false;
		}
		var chr = chrPos[0];
		var startEnd = chrPos[1].replace(",", "").split("-");
		var start = Math.floor(startEnd[0]);
		if(startEnd.length <= 1) {
			startEnd[1] = start;
		}
		var end = Math.floor(startEnd[1]);
		
		if(start > end || start < 1 || isNaN(start) || isNaN(end)) {
			alert("Please input right position.");
			bamRegion.focus();
			return false;
		}
		
		var strand = chrPos[2];
		if(strand == "-1") {
			strand = "-";
		} else {
			strand = "+";
		}
		
		var regionStr = chr + ":" + start + "-" + end;
		if(strand == "-") {
			regionStr += ":-";
		}
		bamRegion.value = regionStr;
		
		return [chr, start, end, strand];
}





window.onload = function() {
	prepareBamSearch();
	prepareBigWigSearch();
	prepareTabixSearch();
	prepareGziSearch();
};

/////

const prepareGziSearch = () => {
  let gzi;
  
  const gziRegionElm = document.getElementById("gzi_region");
  const gziResElm = document.getElementById("gzi_result");
  
  const selFileElm = document.getElementById("gzi_files");
  selFileElm.addEventListener("change", function() {
    gziResElm.innerHTML = "";
    const fList = getSortedGziFiles(this.files);
    if(fList) {
      gzi = new FastaData(fList, {localFlg: true});
      gziShowBtnElm.disabled = false;
    } else {
      gziShowBtnElm.disabled = true;
      gziResElm.innerHTML = "<div>Error: Please select \"*.gz\", \"*.gz.gzi\" and \"*.gz.fai\" files.</div>";
    }
  }, false);
  
  let gziShowBtnElm = document.getElementById("gzi_show_btn");
  gziShowBtnElm.disabled = true;
  gziShowBtnElm.addEventListener("click", function(e) {
    const posList = getChromStartEndStrand(gziRegionElm);
    if(posList) {
      let chr = posList[0];
      let start = posList[1];
      let end = posList[2];
      let strand = posList[3];
      gziResElm.innerHTML = "wait...";
      gzi.readWaitReader(chr, start, end, function(fetcher) {
        let seq = "";
        for(const seqEach of fetcher()) {
          seq += seqEach;
        }
        gziResElm.innerHTML = "<textarea rows=\"10\" cols=\"100\">" + seq + "</textarea>";
      }, function(err) {
        alert("fail to access data:" + err);
        gziResElm.innerHTML = "";
      });
    } else {
      gziResElm.innerHTML = "<div>Error: Please input right genomic position.</div>";
      gziRegionElm.focus();
    }
  });
};

const prepareTabixSearch = () => {
	var tbi;
	
	var tbiRegionElm = document.getElementById("tbi_region");
	var tbiResElm = document.getElementById("tbi_result");
	
	var selFileElm = document.getElementById("tbi_files");
	selFileElm.addEventListener("change", function() {
		tbiResElm.innerHTML = "";
		var fList = this.files;
		if(isVcfAndTbi(fList)) {
			tbi = new TabixData(fList, {localFlg: true});
			tbiShowBtnElm.disabled = false;
		} else {
			tbiShowBtnElm.disabled = true;
			tbiResElm.innerHTML = "<div>Error: Please select both \"*.vcf.gz\" and \"*.vcf.gz.tbi\" files.</div>";
		}
	}, false);
	
	var tbiShowBtnElm = document.getElementById("tbi_show_btn");
	tbiShowBtnElm.disabled = true;
	tbiShowBtnElm.addEventListener("click", function(e) {
		var posList = getChromStartEndStrand(tbiRegionElm);
		if(posList) {
			var chr = posList[0];
			var start = posList[1];
			var end = posList[2];
			var strand = posList[3];
			var reads = [];
			tbiResElm.innerHTML = "wait...";
			tbi.readWaitReader(chr, start, end, function(fetcher) {
				var clmSampleList = tbi.getColumnSampleList();
				var data = [];
				for(var alnEach of fetcher()) {
					//var chr_ = alnEach[0];
					var pos = alnEach[1];
					var id = alnEach[2];
					var ref = alnEach[3];
					var alt = alnEach[4];
					var qual = alnEach[5];
					var filter = alnEach[6];
					var info = alnEach[7];
					//var format = (alnEach[8] === undefined)? []: alnEach[8].split(/:/);
					var format = alnEach[8];
					
					var dtList = [];
					for(var i = 9; i < alnEach.length; i ++) {
						dtList.push(alnEach[i]);
					}
					
					data.push({
						pos: parseInt(pos),
						id: id,
						ref: ref,
						alt: alt,
						qual: qual,
						filter: filter,
						info: info,
						format: format,
						dtList: dtList
					});
				}
				
				if(data.length > 0) {
					showTbiTable(chr, data, clmSampleList);
				} else {
					document.getElementById("tbi_result").innerHTML 
						= "<div>No hit read in \"" + tbiRegionElm.value + "\"</div>";
				}
			}, function(err) {
				alert("fail to access data:" + err);
				tbiResElm.innerHTML = "";
			});
		} else {
			tbiResElm.innerHTML = "<div>Error: Please input right genomic position.</div>";
			tbiRegionElm.focus();
		}
	});
};

const showTbiTable = (chr, data, clmSampleList) => {
	var hitCnt = data.length;
	var tableStr = "<div>Total hit count: " + hitCnt + "</div>";
	if(hitCnt > 100) {
		tableStr += "<div>First and last 50 data were displayed.</div>";
	}
	tableStr += "<table border=\"1\"><tr><th>No.</th>";
	for(var i = 0; i < clmSampleList.length; i ++) {
		tableStr += "<th>" + clmSampleList[i] + "</th>";
	}
	tableStr += "</tr>\n";
	if(hitCnt > 100) {
		for(var i = 0; i < 50; i ++) {
			var dt = data[i];
			tableStr += "<tr><td align=\"right\">" + (i + 1) + "</td><td>" 
				+ chr + "</td><td align=\"right\">" 
				+ dt.pos + "</td><td>"  + dt.id + "</td><td>" 
				+ dt.ref + "</td><td>" + dt.alt + "</td><td>" 
				+ dt.qual + "</td><td>" + dt.filter + "</td><td>" 
				+ dt.info + "</td>";
			
			if(dt.format !== undefined) {
				tableStr += "<td>" + dt.format + "</td>";
			}
			for(var j = 0; j < dt.dtList.length; j ++) {
				tableStr += "<td>" + dt.dtList[j] + "</td>";
			}
			tableStr += "</tr>\n";
		}
		for(var i = hitCnt - 50; i < hitCnt; i ++) {
			var dt = data[i];
			tableStr += "<tr><td align=\"right\">" + (i + 1) + "</td><td>" 
				+ chr + "</td><td align=\"right\">" 
				+ dt.pos + "</td><td>"  + dt.id + "</td><td>" 
				+ dt.ref + "</td><td>" + dt.alt + "</td><td>" 
				+ dt.qual + "</td><td>" + dt.filter + "</td><td>" 
				+ dt.info + "</td>";
			
			if(dt.format !== undefined) {
				tableStr += "<td>" + dt.format + "</td>";
			}
			for(var j = 0; j < dt.dtList.length; j ++) {
				tableStr += "<td>" + dt.dtList[j] + "</td>";
			}
			tableStr += "</tr>\n";
		}
	} else {
		for(var i = 0; i < hitCnt; i ++) {
			var dt = data[i];
			tableStr += "<tr><td align=\"right\">" + (i + 1) + "</td><td>" 
				+ chr + "</td><td align=\"right\">" 
				+ dt.pos + "</td><td>"  + dt.id + "</td><td>" 
				+ dt.ref + "</td><td>" + dt.alt + "</td><td>" 
				+ dt.qual + "</td><td>" + dt.filter + "</td><td>" 
				+ dt.info + "</td>";
			
			if(dt.format !== undefined) {
				tableStr += "<td>" + dt.format + "</td>";
			}
			for(var j = 0; j < dt.dtList.length; j ++) {
				tableStr += "<td>" + dt.dtList[j] + "</td>";
			}
			tableStr += "</tr>\n";
		}
	}
	tableStr += "</table>";
	
	var tbiResElm = document.getElementById("tbi_result");
	tbiResElm.innerHTML = tableStr;
};

const isVcfAndTbi = (fList) => {
	if(fList.length == 2) {
		var name0 = fList[0].name;
		var name1 = fList[1].name;
		if(name0.substr(-11, 11) == ".vcf.gz.tbi") {
			var fTmp = fList[0];
			fList[0] = fList[1];
			fList[1] = fTmp;
		}
		if(name0.substr(-7, 7) == ".vcf.gz" && name1.substr(-11, 11) == ".vcf.gz.tbi") {
			return true;
		}
	}
	
	return false;
};

const getSortedGziFiles = (fList) => {
  if(fList.length == 3) {
    let newFList = [fList[0], fList[1], fList[2]];
    if(
      newFList[0].name.substr(-7) == ".gz.gzi" || 
      newFList[0].name.substr(-7) == ".gz.fai"
    ) {
      const fTmp = newFList[0];
      if(newFList[1].name.substr(-3) == ".gz") {
        newFList[0] = newFList[1];
        newFList[1] = fTmp;
      } else {
        newFList[0] = newFList[2];
        newFList[2] = fTmp;
      }
    }
    if(newFList[1].name.substr(-7) == ".gz.fai") {
      const fTmp = newFList[1];
      newFList[1] = newFList[2];
      newFList[2] = fTmp;
    }
    if(
      newFList[0].name.substr(-3) == ".gz" && 
      newFList[1].name.substr(-7) == ".gz.gzi" && 
      newFList[2].name.substr(-7) == ".gz.fai"
    ) {
      return newFList;
    }
  }
  
  return ;
};


/////

const prepareBigWigSearch = () => {
	var bw;
	
	var bwRegionElm = document.getElementById("bw_region");
	var bwResElm = document.getElementById("bw_result");
	
	var selFileElm = document.getElementById("bw_file");
	selFileElm.addEventListener("change", function() {
		bwResElm.innerHTML = "";
		var fList = this.files;
		var fType = getBwBb(fList);
		if(fType) {
			bw = new BigbedData(fList[0], {localFlg: true});
			bwShowBtnElm.disabled = false;
		} else {
			bwShowBtnElm.disabled = true;
			bwResElm.innerHTML = "<div>Error: Please select \"*.bw\" or \"*.bb\" file.</div>";
		}
	}, false);
	
	var bwShowBtnElm = document.getElementById("bw_show_btn");
	bwShowBtnElm.disabled = true;
	bwShowBtnElm.addEventListener("click", function(e) {
		var posList = getChromStartEndStrand(bwRegionElm);
		if(posList) {
			var chr = posList[0];
			var start = posList[1];
			var end = posList[2];
			var strand = posList[3];
			var reads = [];
			bwResElm.innerHTML = "wait...";
			var queryLevel = Math.pow(10, Math.floor(Math.LOG10E * Math.log((end - start + 1) / 1000)));
			if(queryLevel < 1) queryLevel = 1;
			bw.readWaitReader(chr, start, end, queryLevel, function(reductionLevel, fetcher) {
				var clmMax = 0;
				var data = [];
				for(var alnEach of fetcher()) {
					var num = (reductionLevel)? alnEach.maxVal: alnEach.value;
					if(num === undefined) {
						var bedClm = alnEach.otherClm.split(/\t/);
						if(clmMax < bedClm.length) clmMax = bedClm.length;
						data.push({
							type: "bed", 
							start: alnEach.chromStart, 
							end: alnEach.chromEnd, 
							bedClm: bedClm 
						});
					} else {
						data.push({
							type: "wig", 
							start: alnEach.chromStart, 
							end: alnEach.chromEnd, 
							num: num 
						});
					}
				}
				
				if(data.length > 0) {
					showBwTable(chr, data, clmMax, reductionLevel);
				} else {
					document.getElementById("bw_result").innerHTML 
						= "<div>No data in \"" + bwRegionElm.value + "\"</div>";
				}
			}, function(err) {
				alert("fail to access data:" + err);
				bwResElm.innerHTML = "";
			});
		} else {
			console.log(posList);
			bwResElm.innerHTML = "<div>Error: Please input right genomic position.</div>";
			bwRegionElm.focus();
		}
	});
};

const showBwTable = (chr, data, clmMax, reductionLevel) => {
	var hitCnt = data.length;
	var tableStr = "<div>Reduction level: " + reductionLevel + "</div>";
	tableStr += "<div>Total hit count: " + hitCnt + "</div>";
	if(hitCnt > 100) {
		tableStr += "<div>First and last 50 data were displayed.</div>";
	}
	var type = data[0].type;
	
	tableStr += "<table border=\"1\"><tr><th>No.</th><th>chrom</th><th>chromStart</th><th>chromEnd</th>";
	if(type == "wig") {
		tableStr += "<th>num</th>";
	} else {
		var clm = [
			"name", "score", "strand", "thickStart", "thickEnd", 
			"itemRgb", "blockCount", "blockSizes", "blockStarts"
		];
		for(var i = 0; i < clmMax; i ++) {
			tableStr += "<th>" + clm[i] + "</th>";
		}
		tableStr += "</tr>\n";
	}
	if(hitCnt > 100) {
		for(var i = 0; i < 50; i ++) {
			var dt = data[i];
			tableStr += "<tr><td align=\"right\">" + (i + 1) + "</td><td>" 
				+ chr + "</td><td align=\"right\">" 
				+ dt.start + "</td><td align=\"right\">"  + dt.end + "</td>";
			
			if(type == "wig") {
				tableStr += "<td align=\"right\">" + dt.num + "</td></tr>\n";
			} else {
				for(var j = 0; j < dt.bedClm.length; j ++) {
					tableStr += "<td>" + dt.bedClm[j] + "</td>";
				}
				tableStr += "</tr>\n";
			}
		}
		for(var i = hitCnt - 50; i < hitCnt; i ++) {
			var dt = data[i];
			tableStr += "<tr><td align=\"right\">" + (i + 1) + "</td><td>" 
				+ chr + "</td><td align=\"right\">" 
				+ dt.start + "</td><td align=\"right\">"  + dt.end + "</td>";
			
			if(type == "wig") {
				tableStr += "<td align=\"right\">" + dt.num + "</td></tr>\n";
			} else {
				for(var j = 0; j < dt.bedClm.length; j ++) {
					tableStr += "<td>" + dt.bedClm[j] + "</td>";
				}
				tableStr += "</tr>\n";
			}
		}
	} else {
		for(var i = 0; i < hitCnt; i ++) {
			var dt = data[i];
			tableStr += "<tr><td align=\"right\">" + (i + 1) + "</td><td>" 
				+ chr + "</td><td align=\"right\">" 
				+ dt.start + "</td><td align=\"right\">"  + dt.end + "</td>";
			
			if(type == "wig") {
				tableStr += "<td align=\"right\">" + dt.num + "</td></tr>\n";
			} else {
				for(var j = 0; j < dt.bedClm.length; j ++) {
					tableStr += "<td>" + dt.bedClm[j] + "</td>";
				}
				tableStr += "</tr>\n";
			}
		}
	}
	tableStr += "</table>";
	
	var bwResElm = document.getElementById("bw_result");
	bwResElm.innerHTML = tableStr;
};

const getBwBb = (fList) => {
	if(fList.length == 1) {
		var name0 = fList[0].name;
		if(name0.substr(-3, 3) == ".bw") {
			return ".bw";
		}
		if(name0.substr(-3, 3) == ".bb") {
			return ".bb";
		}
	}
	
	return false;
};

/////

const prepareBamSearch = () => {
	var bam;
	
	var bamRegionElm = document.getElementById("bam_region");
	var bamResElm = document.getElementById("bam_result");
	
	var selFileElm = document.getElementById("bam_files");
	selFileElm.addEventListener("change", function() {
		bamResElm.innerHTML = "";
		var fList = this.files;
		if(isBamAndBai(fList)) {
			bam = new BamData(fList, {localFlg: true});
			bamShowBtnElm.disabled = false;
		} else {
			bamShowBtnElm.disabled = true;
			bamResElm.innerHTML = "<div>Error: Please select both \"*.bam\" and \"*.bam.bai\" files.</div>";
		}
	}, false);
	
	var bamShowBtnElm = document.getElementById("bam_show_btn");
	bamShowBtnElm.disabled = true;
	bamShowBtnElm.addEventListener("click", function(e) {
		var posList = getChromStartEndStrand(bamRegionElm);
		if(posList) {
			var chr = posList[0];
			var start = posList[1];
			var end = posList[2];
			var strand = posList[3];
			var reads = [];
			bamResElm.innerHTML = "wait...";
			bam.readWaitReader(chr, start, end, function(fetcher) {
				var counter = 0;
				for(var alnEach of fetcher()) {
					reads.push({
						qname: alnEach[3], flag: alnEach[2], pos: alnEach[0], mapq: alnEach[1], 
						cigar: alnEach[4], seq: alnEach[6], posEnd: alnEach[5], id: alnEach[11], 
						cigarLn: alnEach[12], cigarOp: alnEach[13]
					});
					counter ++;
					if(counter % 100000 == 0) {
						alert("Too many read (>= 100000) and some reads truncated. " + chr 
							+ ":" + bpStart + "-" + bpEnd + " will be incomplete display.");
						break;
					}
				}
				if(counter > 0) {
					showBamTable(chr, reads);
				} else {
					document.getElementById("bam_result").innerHTML 
						= "<div>No hit read in \"" + bamRegionElm.value + "\"</div>";
				}
			}, function(err) {
				alert("fail to access data:" + err);
				bamResElm.innerHTML = "";
			});
		} else {
			bamResElm.innerHTML = "<div>Error: Please input right genomic position.</div>";
			bamRegionElm.focus();
		}
	});
};

const showBamTable = (chr, reads) => {
	var hitCnt = reads.length;
	var tableStr = "<div>Total hit count: " + hitCnt + "</div>";
	if(hitCnt > 100) {
		tableStr += "<div>First and last 50 data were displayed.</div>";
	}
	tableStr += "<table border=\"1\"><tr><th>No.</th><th>QNAME</th><th>FLAG</th><th>RNAME</th>";
	tableStr += "<th>POS</th><th>MAPQ</th><th>CIGAR</th><th>SEQ</th><th>POS_END</th></tr>\n";
	if(hitCnt > 100) {
		for(var i = 0; i < 50; i ++) {
			var dt = reads[i];
			tableStr += "<tr><td align=\"right\">" + (i + 1) + "</td><td>" 
				+ dt.qname + "</td><td align=\"right\">" 
				+ dt.flag + "</td><td>"  + chr + "</td><td>" 
				+ dt.pos + "</td><td align=\"right\">" + dt.mapq + "</td><td>" 
				+ dt.cigar + "</td><td>" + dt.seq + "</td><td align=\"right\">" 
				+ dt.posEnd + "</td></tr>\n";
		}
		for(var i = hitCnt - 50; i < hitCnt; i ++) {
			var dt = reads[i];
			tableStr += "<tr><td align=\"right\">" + (i + 1) + "</td><td>" 
				+ dt.qname + "</td><td align=\"right\">" 
				+ dt.flag + "</td><td>"  + chr + "</td><td>" 
				+ dt.pos + "</td><td align=\"right\">" + dt.mapq + "</td><td>" 
				+ dt.cigar + "</td><td>" + dt.seq + "</td><td align=\"right\">" 
				+ dt.posEnd + "</td></tr>\n";
		}
	} else {
		for(var i = 0; i < hitCnt; i ++) {
			var dt = reads[i];
			tableStr += "<tr><td align=\"right\">" + (i + 1) + "</td><td>" 
				+ dt.qname + "</td><td align=\"right\">" 
				+ dt.flag + "</td><td>"  + chr + "</td><td>" 
				+ dt.pos + "</td><td align=\"right\">" + dt.mapq + "</td><td>" 
				+ dt.cigar + "</td><td>" + dt.seq + "</td><td align=\"right\">" 
				+ dt.posEnd + "</td></tr>\n";
		}
	}
	tableStr += "</table>";
	
	var bamResElm = document.getElementById("bam_result");
	bamResElm.innerHTML = tableStr;
};

const getChromStartEndStrand = (elm) => {
	var bamRegionValue = elm.value;
	var chrPos = bamRegionValue.replace(" ", "").split(":");
	if(chrPos.length <= 1) {
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
	elm.value = regionStr;
	
	return [chr, start, end, strand];
};

const isBamAndBai = (fList) => {
	if(fList.length == 2) {
		var name0 = fList[0].name;
		var name1 = fList[1].name;
		if(name0.substr(-8, 8) == ".bam.bai") {
			var fTmp = fList[0];
			fList[0] = fList[1];
			fList[1] = fTmp;
		}
		if(name0.substr(-4, 4) == ".bam" && name1.substr(-8, 8) == ".bam.bai") {
			return true;
		}
	}
	
	return false;
};


Javascript programs for NGS data
====

Data parser for NGS data.

## Getting Started

### Demo

[Demo](https://mession.ddo.jp/~wakaguri/ngs_js/)   

### Requirement

Web browser: Edge (V40 above), Google Chrome (V61 above) or Firefox (V56 above).  
(JavaScript Generator supported web browser required)

---
### Usage
####  Import bam.js:
Please see [sample.html](sample.html).

    <script src="js/bam.js"></script>
 
#### Extraction of reads data:
For example, in case of extracting alignment information of **chr22: 20000000-20001000** region of the "sample/ENCFF437TPA_chr22_cut.sorted.bam" file. This javascript program is designed to check the result from console. Check the results with the developer tool of your web browser.


	<script>
		//bamObject = new BamData(<BamURL>);
		let bam = new BamData("download/ENCFF437TPA_chr22_cut.sorted.bam");
		
		//bamObject.readWaitReader(<chromosome>, <chromStart>, <chromEnd>, <callbackFunc>, <errorFunc>);
		bam.readWaitReader("chr22", 20000000, 20001000, function(fetcher) {
		    for(var alnEach of fetcher()) {
			    console.log(alnEach);
		    }
		}, function(err) {
		    alert("Fail to data access:" + err);
		});
	</script>
* The "download" program is perl CGI script. If you are using Apache, enable the .htaccess setting by changing the setting against your open directory from "Allowoverride None" to "Allowoverride All". 
* Alternatively, you can use the sample directory instead of the download program, but you cannot use it if the response header contains extra values. When using the sample directory, change from new BamData ("download / ENCFF437TPA_chr22_cut.sorted.bam") to new BamData ("sample / ENCFF437TPA_chr22_cut.sorted.bam").

---
#### For bigbed.js and tabix.js
For bigbed, bigwig and tabix.js, you can fetch data in almost the same way. See sample.html as well. If you want to check bigbed.js, please uncomment "Usage of bigBed (or bigWig) module" and check. If you want to check the VCF/tabix file, remove the comment from "Usage of VCF/tabix module" and check it. For reductionLevel of bigbed and bigwig, you can get all the data by setting "1".

---
### For demo page installation
#### For demo page installation:

    cd /your/open/web_directory/
    git clone https://github.com/h-wakaguri/ngs_js.git
    
    #please access demo page: http://your_domain/ngs_js/index.html

The demo page is a program to display the NGS result file on the local PC.
If you want to use the files in the sample directory, download the desired files to your PC and test.

#### Usage for Bam finder:
1.  At first, please select "bam and bam.bai" files from the [files ...] button. At this time, select both files at once. If you select only one file, it will fail to load. Similarly, for VCF data, both ".vcf.gz" and ".vcf.gz.tbi" must be selected at the same time (one file for .bb and .bw must be selected).
2. Next, in the "Genomic region" text box, enter the genomic region of your interest in the format "<chrom>: <start>-<end>" (eg "chr22: 20000000-20001000").
3. When you click the [show] button, up to 100 search results will be displayed below it.

---
### License

This project is licensed under the [MIT](https://raw.githubusercontent.com/b4b4r07/dotfiles/master/doc/LICENSE-MIT.txt) License

---
### Reference
- SAM/BAM format: [https://samtools.github.io/hts-specs/SAMv1.pdf](https://samtools.github.io/hts-specs/SAMv1.pdf)
- BigWig/BigBed format: 
- The Tabix index file format: [https://samtools.github.io/hts-specs/tabix.pdf](https://samtools.github.io/hts-specs/tabix.pdf)


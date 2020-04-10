Scorecard Extension for Design Studio
=================================================

![Scorecard Extension](https://github.com/AnnieMT/scorecard-dataviz-design-studio/blob/master/screenshots/runtime.png)

Files
-----------
* `Scorecard_CheckboxFilter` - Source code for extension
* `Scorecard_CheckboxFilter.zip` - Installable extension on SAP BusinessObjects DesignStudio
* `SCORECARD.zip` - SAP BusinessObjects DesignStudio document with extension sample
* `scorecard.css` - Custom CSS file to import
* `screenshots` - Folder for readme images

Installation Instructions
--------------------------
Here is a step-by-step guide on how to use this particular extension:

**Section 1: Installing the extension**

1. Start up SAP BusinessObjects DesignStudio on your laptop. In the menu bar, go to **Tools** and select **Install Extension to Design Studio**

  ![Install](https://github.com/AnnieMT/Scorecard_DesignStudio/blob/master/screenshots/install1.png)
  
2. Select the **Archive** and install the installable extension `Scorecard_CheckboxFilter.zip` and then click **OK**

  ![Install](https://github.com/AnnieMT/Scorecard_DesignStudio/blob/master/screenshots/install2.png)
  
3. Follow the rest of prompts to continue with the installation and restart Design Studio

**Section 2: Getting started**

1. Create a new Design Studio file or application by clicking on the **New** icon at the top left corner. Alternatively, you can select **Application** from the menu bar and go to **New** or just press **Ctrl + N** on your keyboard. 

  ![New Application](https://github.com/AnnieMT/Scorecard_DesignStudio/blob/master/screenshots/new.png)
  
2. Type in the name of your application and select the **Blank** template from **Standard** templates. Select **Create**. Your new application file will be created.

  ![Create New Application](https://github.com/AnnieMT/Scorecard_DesignStudio/blob/master/screenshots/new2.png)

**Section 3: Working with data**

1. In your newly created application, go to the **Outline** panel on the bottom left corner. You will see the following structure of files for the application. Right click on **Data Sources** and select **Add Data Source**
 
  ![Data source](https://github.com/AnnieMT/Scorecard_DesignStudio/blob/master/screenshots/data1.png)
  
  A pop-up will appear, which asks you to define the data source you are adding. Select **HDB** and connect to your designated HDB which has the data source in it.
 
  ![HDB](https://github.com/AnnieMT/Scorecard_DesignStudio/blob/master/screenshots/data2.png)
  
  After this is done, select **OK**

  ![HDB](https://github.com/AnnieMT/Scorecard_DesignStudio/blob/master/screenshots/data3.png)
  
2. Now we must define the structure of the data. Right click on the data source that was just imported, and select **Edit Initial View** 

  ![Edit Initial View](https://github.com/AnnieMT/Scorecard_DesignStudio/blob/master/screenshots/data4.png)
  
  The initial view of the data will appear. Drag the **Measures (Number)** and **Date** to the **Columns** section, and drag the **Description** to the **Rows** section as shown. Your data table should look as shown below. Click on **OK**.
 
  ![Initial View](https://github.com/AnnieMT/Scorecard_DesignStudio/blob/master/screenshots/data5.png)
  
3. Next, in the **Properties** panel on the top right corner, go to the **Data Binding** section and select the drop-down arrow that corresponds to **Data Source** and choose **DS_1** (assuming that the data source loaded was saved as DS_1)

  ![Edit Initial View](https://github.com/AnnieMT/Scorecard_DesignStudio/blob/master/screenshots/data6.png)
  
4. Now comes the data selection parts. This is where we define which measures or dimensions of the data define the rendering of the components of the chart. In the **Stacked Column Set** section right below the Data Source section, there will be a clickable button that gives you more options. Click on that as shown. This will open up the **Select Data** pop up where you can define which rows will be used for the stacked column set. Select all rows with a **Stage*** prefix as shown. 
 
  ![Stacked Column Set](https://github.com/AnnieMT/Scorecard_DesignStudio/blob/master/screenshots/data7.png)
  
  Repeat the same for the **Line Set** and **Center Column** as well. 
 
  ![Line Set](https://github.com/AnnieMT/Scorecard_DesignStudio/blob/master/screenshots/data8.png)
  
  ![Center Column](https://github.com/AnnieMT/Scorecard_DesignStudio/blob/master/screenshots/data9.png)

**Section 4: Final Steps**

1. Import the custom CSS file called **scorecard.css** by removing the selection from the layout of the chart. You can do this by just clicking on the top-level application. Now go to the **Properties** panel and in the **Display** section, go to the **Custom CSS** part. Here is where you import the custom CSS file. 
  
  ![Custom CSS](https://github.com/AnnieMT/Scorecard_DesignStudio/blob/master/screenshots/CSS.png)
  
  The chart will now render in the designer. Click on the green **Run** button on the tool bar as shown. 
  
  ![HDB](https://github.com/AnnieMT/Scorecard_DesignStudio/blob/master/screenshots/final_designer.png)
  
  This will run the chart in a browser. The final chart should look like this.
 
  ![HDB](https://github.com/AnnieMT/Scorecard_DesignStudio/blob/master/screenshots/runtime.png)
